import { Subject } from "rxjs";
import { Jsonify } from "type-fest";

import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { KeyGenerationService } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
  StorageUpdate,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { MemoryStorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { BrowserApi } from "../browser/browser-api";
import { devFlag } from "../decorators/dev-flag.decorator";
import { devFlagEnabled } from "../flags";
import { MemoryStoragePortMessage } from "../storage/port-messages";
import { portName } from "../storage/port-name";

export class LocalBackedSessionStorageService
  extends AbstractMemoryStorageService
  implements ObservableStorageService
{
  private updatesSubject = new Subject<StorageUpdate>();
  private commandName = `localBackedSessionStorage_${this.partitionName}`;
  private encKey = `localEncryptionKey_${this.partitionName}`;
  private sessionKey = `session_${this.partitionName}`;
  private cachedSession: Record<string, unknown> = {};
  private _ports: Set<chrome.runtime.Port> = new Set([]);
  private knownNullishCacheKeys: Set<string> = new Set([]);

  constructor(
    private logService: LogService,
    private encryptService: EncryptService,
    private keyGenerationService: KeyGenerationService,
    private localStorage: AbstractStorageService,
    private sessionStorage: AbstractStorageService,
    private platformUtilsService: PlatformUtilsService,
    private partitionName: string,
  ) {
    super();

    BrowserApi.addListener(chrome.runtime.onConnect, (port) => {
      if (port.name !== `${portName(chrome.storage.session)}_${partitionName}`) {
        return;
      }

      this._ports.add(port);

      const listenerCallback = this.onMessageFromForeground.bind(this);
      port.onDisconnect.addListener(() => {
        this._ports.delete(port);
        port.onMessage.removeListener(listenerCallback);
      });
      port.onMessage.addListener(listenerCallback);
      // Initialize the new memory storage service with existing data
      this.sendMessageTo(port, {
        action: "initialization",
        data: Array.from(Object.keys(this.cachedSession)),
      });
    });
    this.updates$.subscribe((update) => {
      this.broadcastMessage({
        action: "subject_update",
        data: update,
      });
    });
  }

  get valuesRequireDeserialization(): boolean {
    return true;
  }

  get updates$() {
    return this.updatesSubject.asObservable();
  }

  async get<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T> {
    if (this.cachedSession[key] != null) {
      return this.cachedSession[key] as T;
    }

    if (this.knownNullishCacheKeys.has(key)) {
      return null;
    }

    return await this.getBypassCache(key, options);
  }

  async getBypassCache<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T> {
    const session = await this.getLocalSession(await this.getSessionEncKey());
    if (session[key] == null) {
      this.knownNullishCacheKeys.add(key);
      return null;
    }

    let value = session[key];
    if (options?.deserializer != null) {
      value = options.deserializer(value as Jsonify<T>);
    }

    void this.save(key, value);
    return value as T;
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  async save<T>(key: string, obj: T): Promise<void> {
    // This is for observation purposes only. At some point, we don't want to write to local session storage if the value is the same.
    if (this.platformUtilsService.isDev()) {
      const existingValue = this.cachedSession[key] as T;
      if (this.compareValues<T>(existingValue, obj)) {
        this.logService.warning(`Possible unnecessary write to local session storage. Key: ${key}`);
        this.logService.warning(obj as any);
      }
    }

    if (obj == null) {
      return await this.remove(key);
    }

    this.knownNullishCacheKeys.delete(key);
    this.cachedSession[key] = obj;
    await this.updateLocalSessionValue(key, obj);
    this.updatesSubject.next({ key, updateType: "save" });
  }

  async remove(key: string): Promise<void> {
    this.knownNullishCacheKeys.add(key);
    delete this.cachedSession[key];
    await this.updateLocalSessionValue(key, null);
    this.updatesSubject.next({ key, updateType: "remove" });
  }

  private async updateLocalSessionValue<T>(key: string, obj: T) {
    const sessionEncKey = await this.getSessionEncKey();
    const localSession = (await this.getLocalSession(sessionEncKey)) ?? {};
    localSession[key] = obj;
    void this.setLocalSession(localSession, sessionEncKey);
  }

  async getLocalSession(encKey: SymmetricCryptoKey): Promise<Record<string, unknown>> {
    if (Object.keys(this.cachedSession).length > 0) {
      return this.cachedSession;
    }

    this.cachedSession = {};
    const local = await this.localStorage.get<string>(this.sessionKey);
    if (local == null) {
      return this.cachedSession;
    }

    if (devFlagEnabled("storeSessionDecrypted")) {
      return local as any as Record<string, unknown>;
    }

    const sessionJson = await this.encryptService.decryptToUtf8(new EncString(local), encKey);
    if (sessionJson == null) {
      // Error with decryption -- session is lost, delete state and key and start over
      await this.setSessionEncKey(null);
      await this.localStorage.remove(this.sessionKey);
      return this.cachedSession;
    }

    this.cachedSession = JSON.parse(sessionJson);
    return this.cachedSession;
  }

  async setLocalSession(session: Record<string, unknown>, key: SymmetricCryptoKey) {
    if (devFlagEnabled("storeSessionDecrypted")) {
      await this.setDecryptedLocalSession(session);
    } else {
      await this.setEncryptedLocalSession(session, key);
    }
  }

  @devFlag("storeSessionDecrypted")
  async setDecryptedLocalSession(session: Record<string, unknown>): Promise<void> {
    // Make sure we're storing the jsonified version of the session
    const jsonSession = JSON.parse(JSON.stringify(session));
    if (session == null) {
      await this.localStorage.remove(this.sessionKey);
    } else {
      await this.localStorage.save(this.sessionKey, jsonSession);
    }
  }

  async setEncryptedLocalSession(session: Record<string, unknown>, key: SymmetricCryptoKey) {
    const jsonSession = JSON.stringify(session);
    const encSession = await this.encryptService.encrypt(jsonSession, key);

    if (encSession == null) {
      return await this.localStorage.remove(this.sessionKey);
    }
    await this.localStorage.save(this.sessionKey, encSession.encryptedString);
  }

  async getSessionEncKey(): Promise<SymmetricCryptoKey> {
    let storedKey = await this.sessionStorage.get<SymmetricCryptoKey>(this.encKey);
    if (storedKey == null || Object.keys(storedKey).length == 0) {
      const generatedKey = await this.keyGenerationService.createKeyWithPurpose(
        128,
        "ephemeral",
        "bitwarden-ephemeral",
      );
      storedKey = generatedKey.derivedKey;
      await this.setSessionEncKey(storedKey);
      return storedKey;
    } else {
      return SymmetricCryptoKey.fromJSON(storedKey);
    }
  }

  async setSessionEncKey(input: SymmetricCryptoKey): Promise<void> {
    if (input == null) {
      await this.sessionStorage.remove(this.encKey);
    } else {
      await this.sessionStorage.save(this.encKey, input);
    }
  }

  private compareValues<T>(value1: T, value2: T): boolean {
    if (value1 == null && value2 == null) {
      return true;
    }

    if (value1 && value2 == null) {
      return false;
    }

    if (value1 == null && value2) {
      return false;
    }

    if (typeof value1 !== "object" || typeof value2 !== "object") {
      return value1 === value2;
    }

    if (JSON.stringify(value1) === JSON.stringify(value2)) {
      return true;
    }

    return Object.entries(value1).sort().toString() === Object.entries(value2).sort().toString();
  }

  private async onMessageFromForeground(
    message: MemoryStoragePortMessage,
    port: chrome.runtime.Port,
  ) {
    if (message.originator === "background") {
      return;
    }

    let result: unknown = null;

    switch (message.action) {
      case "get":
      case "getBypassCache":
      case "has": {
        result = await this[message.action](message.key);
        break;
      }
      case "save":
        await this.save(message.key, JSON.parse((message.data as string) ?? null) as unknown);
        break;
      case "remove":
        await this.remove(message.key);
        break;
    }

    this.sendMessageTo(port, {
      id: message.id,
      key: message.key,
      data: JSON.stringify(result),
    });
  }

  protected broadcastMessage(data: Omit<MemoryStoragePortMessage, "originator">) {
    this._ports.forEach((port) => {
      this.sendMessageTo(port, data);
    });
  }

  private sendMessageTo(
    port: chrome.runtime.Port,
    data: Omit<MemoryStoragePortMessage, "originator">,
  ) {
    port.postMessage({
      ...data,
      originator: "background",
    });
  }
}
