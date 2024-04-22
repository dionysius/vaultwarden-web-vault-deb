import { Subject } from "rxjs";
import { Jsonify } from "type-fest";

import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
  StorageUpdate,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { Lazy } from "@bitwarden/common/platform/misc/lazy";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { MemoryStorageOptions } from "@bitwarden/common/platform/models/domain/storage-options";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { BrowserApi } from "../browser/browser-api";
import { MemoryStoragePortMessage } from "../storage/port-messages";
import { portName } from "../storage/port-name";

export class LocalBackedSessionStorageService
  extends AbstractMemoryStorageService
  implements ObservableStorageService
{
  private ports: Set<chrome.runtime.Port> = new Set([]);
  private cache: Record<string, unknown> = {};
  private updatesSubject = new Subject<StorageUpdate>();
  readonly valuesRequireDeserialization = true;
  updates$ = this.updatesSubject.asObservable();

  constructor(
    private readonly sessionKey: Lazy<Promise<SymmetricCryptoKey>>,
    private readonly localStorage: AbstractStorageService,
    private readonly encryptService: EncryptService,
    private readonly platformUtilsService: PlatformUtilsService,
    private readonly logService: LogService,
  ) {
    super();

    BrowserApi.addListener(chrome.runtime.onConnect, (port) => {
      if (port.name !== portName(chrome.storage.session)) {
        return;
      }

      this.ports.add(port);

      const listenerCallback = this.onMessageFromForeground.bind(this);
      port.onDisconnect.addListener(() => {
        this.ports.delete(port);
        port.onMessage.removeListener(listenerCallback);
      });
      port.onMessage.addListener(listenerCallback);
      // Initialize the new memory storage service with existing data
      this.sendMessageTo(port, {
        action: "initialization",
        data: Array.from(Object.keys(this.cache)),
      });
      this.updates$.subscribe((update) => {
        this.broadcastMessage({
          action: "subject_update",
          data: update,
        });
      });
    });
  }

  async get<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T> {
    if (this.cache[key] !== undefined) {
      return this.cache[key] as T;
    }

    return await this.getBypassCache(key, options);
  }

  async getBypassCache<T>(key: string, options?: MemoryStorageOptions<T>): Promise<T> {
    let value = await this.getLocalSessionValue(await this.sessionKey.get(), key);

    if (options?.deserializer != null) {
      value = options.deserializer(value as Jsonify<T>);
    }

    this.cache[key] = value;
    return value as T;
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  async save<T>(key: string, obj: T): Promise<void> {
    // This is for observation purposes only. At some point, we don't want to write to local session storage if the value is the same.
    if (this.platformUtilsService.isDev()) {
      const existingValue = this.cache[key] as T;
      if (this.compareValues<T>(existingValue, obj)) {
        this.logService.warning(`Possible unnecessary write to local session storage. Key: ${key}`);
        this.logService.warning(obj as any);
      }
    }

    if (obj == null) {
      return await this.remove(key);
    }

    this.cache[key] = obj;
    await this.updateLocalSessionValue(key, obj);
    this.updatesSubject.next({ key, updateType: "save" });
  }

  async remove(key: string): Promise<void> {
    this.cache[key] = null;
    await this.updateLocalSessionValue(key, null);
    this.updatesSubject.next({ key, updateType: "remove" });
  }

  private async getLocalSessionValue(encKey: SymmetricCryptoKey, key: string): Promise<unknown> {
    const local = await this.localStorage.get<string>(this.sessionStorageKey(key));
    if (local == null) {
      return null;
    }

    const valueJson = await this.encryptService.decryptToUtf8(new EncString(local), encKey);
    if (valueJson == null) {
      // error with decryption, value is lost, delete state and start over
      await this.localStorage.remove(this.sessionStorageKey(key));
      return null;
    }

    return JSON.parse(valueJson);
  }

  private async updateLocalSessionValue(key: string, value: unknown): Promise<void> {
    if (value == null) {
      await this.localStorage.remove(this.sessionStorageKey(key));
      return;
    }

    const valueJson = JSON.stringify(value);
    const encValue = await this.encryptService.encrypt(valueJson, await this.sessionKey.get());
    await this.localStorage.save(this.sessionStorageKey(key), encValue.encryptedString);
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
    this.ports.forEach((port) => {
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

  private sessionStorageKey(key: string) {
    return `session_${key}`;
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
}
