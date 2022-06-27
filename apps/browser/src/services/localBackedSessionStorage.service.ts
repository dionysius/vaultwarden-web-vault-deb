import { AbstractEncryptService } from "@bitwarden/common/abstractions/abstractEncrypt.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";

import { AbstractKeyGenerationService } from "./abstractions/abstractKeyGeneration.service";
import BrowserLocalStorageService from "./browserLocalStorage.service";
import BrowserMemoryStorageService from "./browserMemoryStorage.service";

const keys = {
  encKey: "localEncryptionKey",
  sessionKey: "session",
};

export class LocalBackedSessionStorageService extends AbstractStorageService {
  private cache = new Map<string, any>();
  private localStorage = new BrowserLocalStorageService();
  private sessionStorage = new BrowserMemoryStorageService();

  constructor(
    private encryptService: AbstractEncryptService,
    private keyGenerationService: AbstractKeyGenerationService
  ) {
    super();
  }

  async get<T>(key: string): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const session = await this.getLocalSession(await this.getSessionEncKey());
    if (session == null || !Object.keys(session).includes(key)) {
      return null;
    }

    this.cache.set(key, session[key]);
    return this.cache.get(key);
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  async save(key: string, obj: any): Promise<void> {
    if (obj == null) {
      this.cache.delete(key);
    } else {
      this.cache.set(key, obj);
    }

    const sessionEncKey = await this.getSessionEncKey();
    const localSession = (await this.getLocalSession(sessionEncKey)) ?? {};
    localSession[key] = obj;
    await this.setLocalSession(localSession, sessionEncKey);
  }

  async remove(key: string): Promise<void> {
    await this.save(key, null);
  }

  async getLocalSession(encKey: SymmetricCryptoKey): Promise<any> {
    const local = await this.localStorage.get<string>(keys.sessionKey);

    if (local == null) {
      return null;
    }

    const sessionJson = await this.encryptService.decryptToUtf8(new EncString(local), encKey);
    if (sessionJson == null) {
      // Error with decryption -- session is lost, delete state and key and start over
      await this.setSessionEncKey(null);
      await this.localStorage.remove(keys.sessionKey);
      return null;
    }
    return JSON.parse(sessionJson);
  }

  async setLocalSession(session: any, key: SymmetricCryptoKey) {
    const jsonSession = JSON.stringify(session);
    const encSession = await this.encryptService.encrypt(jsonSession, key);

    if (encSession == null) {
      return await this.localStorage.remove(keys.sessionKey);
    }
    await this.localStorage.save(keys.sessionKey, encSession.encryptedString);
  }

  async getSessionEncKey(): Promise<SymmetricCryptoKey> {
    let storedKey = (await this.sessionStorage.get(keys.encKey)) as SymmetricCryptoKey;
    if (storedKey == null || Object.keys(storedKey).length == 0) {
      storedKey = await this.keyGenerationService.makeEphemeralKey();
      await this.setSessionEncKey(storedKey);
    }
    return SymmetricCryptoKey.initFromJson(
      Object.create(SymmetricCryptoKey.prototype, Object.getOwnPropertyDescriptors(storedKey))
    );
  }

  async setSessionEncKey(input: SymmetricCryptoKey): Promise<void> {
    if (input == null) {
      await this.sessionStorage.remove(keys.encKey);
    } else {
      await this.sessionStorage.save(keys.encKey, input);
    }
  }
}
