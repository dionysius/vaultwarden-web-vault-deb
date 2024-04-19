import { mock, MockProxy } from "jest-mock-extended";

import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { KeyGenerationService } from "@bitwarden/common/platform/abstractions/key-generation.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  StorageUpdate,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { BrowserApi } from "../browser/browser-api";

import { LocalBackedSessionStorageService } from "./local-backed-session-storage.service";

describe.skip("LocalBackedSessionStorage", () => {
  const sendMessageWithResponseSpy: jest.SpyInstance = jest.spyOn(
    BrowserApi,
    "sendMessageWithResponse",
  );

  let encryptService: MockProxy<EncryptService>;
  let keyGenerationService: MockProxy<KeyGenerationService>;
  let localStorageService: MockProxy<AbstractStorageService>;
  let sessionStorageService: MockProxy<AbstractMemoryStorageService>;
  let logService: MockProxy<LogService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;

  let cache: Record<string, unknown>;
  const testObj = { a: 1, b: 2 };
  const stringifiedTestObj = JSON.stringify(testObj);

  const key = new SymmetricCryptoKey(Utils.fromUtf8ToArray("00000000000000000000000000000000"));
  let getSessionKeySpy: jest.SpyInstance;
  let sendUpdateSpy: jest.SpyInstance<void, [storageUpdate: StorageUpdate]>;
  const mockEnc = (input: string) => Promise.resolve(new EncString("ENCRYPTED" + input));

  let sut: LocalBackedSessionStorageService;

  const mockExistingSessionKey = (key: SymmetricCryptoKey) => {
    sessionStorageService.get.mockImplementation((storageKey) => {
      if (storageKey === "localEncryptionKey_test") {
        return Promise.resolve(key?.toJSON());
      }

      return Promise.reject("No implementation for " + storageKey);
    });
  };

  beforeEach(() => {
    sendMessageWithResponseSpy.mockResolvedValue(null);
    logService = mock<LogService>();
    encryptService = mock<EncryptService>();
    keyGenerationService = mock<KeyGenerationService>();
    localStorageService = mock<AbstractStorageService>();
    sessionStorageService = mock<AbstractMemoryStorageService>();

    sut = new LocalBackedSessionStorageService(
      logService,
      encryptService,
      keyGenerationService,
      localStorageService,
      sessionStorageService,
      platformUtilsService,
      "test",
    );

    cache = sut["cachedSession"];

    keyGenerationService.createKeyWithPurpose.mockResolvedValue({
      derivedKey: key,
      salt: "bitwarden-ephemeral",
      material: null, // Not used
    });

    getSessionKeySpy = jest.spyOn(sut, "getSessionEncKey");
    getSessionKeySpy.mockResolvedValue(key);

    // sendUpdateSpy = jest.spyOn(sut, "sendUpdate");
    // sendUpdateSpy.mockReturnValue();
  });

  describe("get", () => {
    describe("in local cache or external context cache", () => {
      it("should return from local cache", async () => {
        cache["test"] = stringifiedTestObj;
        const result = await sut.get("test");
        expect(result).toStrictEqual(testObj);
      });

      it("should return from external context cache when local cache is not available", async () => {
        sendMessageWithResponseSpy.mockResolvedValue(stringifiedTestObj);
        const result = await sut.get("test");
        expect(result).toStrictEqual(testObj);
      });
    });

    describe("not in cache", () => {
      const session = { test: stringifiedTestObj };

      beforeEach(() => {
        mockExistingSessionKey(key);
      });

      describe("no session retrieved", () => {
        let result: any;
        let spy: jest.SpyInstance;
        beforeEach(async () => {
          spy = jest.spyOn(sut, "getLocalSession").mockResolvedValue(null);
          localStorageService.get.mockResolvedValue(null);
          result = await sut.get("test");
        });

        it("should grab from session if not in cache", async () => {
          expect(spy).toHaveBeenCalledWith(key);
        });

        it("should return null if session is null", async () => {
          expect(result).toBeNull();
        });
      });

      describe("session retrieved from storage", () => {
        beforeEach(() => {
          jest.spyOn(sut, "getLocalSession").mockResolvedValue(session);
        });

        it("should return null if session does not have the key", async () => {
          const result = await sut.get("DNE");
          expect(result).toBeNull();
        });

        it("should return the value retrieved from session", async () => {
          const result = await sut.get("test");
          expect(result).toEqual(session.test);
        });

        it("should set retrieved values in cache", async () => {
          await sut.get("test");
          expect(cache["test"]).toBeTruthy();
          expect(cache["test"]).toEqual(session.test);
        });

        it("should use a deserializer if provided", async () => {
          const deserializer = jest.fn().mockReturnValue(testObj);
          const result = await sut.get("test", { deserializer: deserializer });
          expect(deserializer).toHaveBeenCalledWith(session.test);
          expect(result).toEqual(testObj);
        });
      });
    });
  });

  describe("has", () => {
    it("should be false if `get` returns null", async () => {
      const spy = jest.spyOn(sut, "get");
      spy.mockResolvedValue(null);
      expect(await sut.has("test")).toBe(false);
      expect(spy).toHaveBeenCalledWith("test");
    });

    it("should be true if `get` returns non-null", async () => {
      const spy = jest.spyOn(sut, "get");
      spy.mockResolvedValue({});
      expect(await sut.has("test")).toBe(true);
      expect(spy).toHaveBeenCalledWith("test");
    });
  });

  describe("remove", () => {
    describe("existing cache value is null", () => {
      it("should not save null if the local cached value is already null", async () => {
        cache["test"] = null;
        await sut.remove("test");
        expect(sendUpdateSpy).not.toHaveBeenCalled();
      });

      it("should not save null if the externally cached value is already null", async () => {
        sendMessageWithResponseSpy.mockResolvedValue(null);
        await sut.remove("test");
        expect(sendUpdateSpy).not.toHaveBeenCalled();
      });
    });

    it("should save null", async () => {
      cache["test"] = stringifiedTestObj;

      await sut.remove("test");
      expect(sendUpdateSpy).toHaveBeenCalledWith({ key: "test", updateType: "remove" });
    });
  });

  describe("save", () => {
    describe("currently cached", () => {
      it("does not save the value a local cached value exists which is an exact match", async () => {
        cache["test"] = stringifiedTestObj;
        await sut.save("test", testObj);
        expect(sendUpdateSpy).not.toHaveBeenCalled();
      });

      it("does not save the value if a local cached value exists, even if the keys not in the same order", async () => {
        cache["test"] = JSON.stringify({ b: 2, a: 1 });
        await sut.save("test", testObj);
        expect(sendUpdateSpy).not.toHaveBeenCalled();
      });

      it("does not save the value a externally cached value exists which is an exact match", async () => {
        sendMessageWithResponseSpy.mockResolvedValue(stringifiedTestObj);
        await sut.save("test", testObj);
        expect(sendUpdateSpy).not.toHaveBeenCalled();
        expect(cache["test"]).toBe(stringifiedTestObj);
      });

      it("saves the value if the currently cached string value evaluates to a falsy value", async () => {
        cache["test"] = "null";
        await sut.save("test", testObj);
        expect(sendUpdateSpy).toHaveBeenCalledWith({ key: "test", updateType: "save" });
      });
    });

    describe("caching", () => {
      beforeEach(() => {
        localStorageService.get.mockResolvedValue(null);
        sessionStorageService.get.mockResolvedValue(null);

        localStorageService.save.mockResolvedValue();
        sessionStorageService.save.mockResolvedValue();

        encryptService.encrypt.mockResolvedValue(mockEnc("{}"));
      });

      it("should remove key from cache if value is null", async () => {
        cache["test"] = {};
        // const cacheSetSpy = jest.spyOn(cache, "set");
        expect(cache["test"]).toBe(true);
        await sut.save("test", null);
        // Don't remove from cache, just replace with null
        expect(cache["test"]).toBe(null);
        // expect(cacheSetSpy).toHaveBeenCalledWith("test", null);
      });

      it("should set cache if value is non-null", async () => {
        expect(cache["test"]).toBe(false);
        // const setSpy = jest.spyOn(cache, "set");
        await sut.save("test", testObj);
        expect(cache["test"]).toBe(stringifiedTestObj);
        // expect(setSpy).toHaveBeenCalledWith("test", stringifiedTestObj);
      });
    });

    describe("local storing", () => {
      let setSpy: jest.SpyInstance;

      beforeEach(() => {
        setSpy = jest.spyOn(sut, "setLocalSession").mockResolvedValue();
      });

      it("should store a new session", async () => {
        jest.spyOn(sut, "getLocalSession").mockResolvedValue(null);
        await sut.save("test", testObj);

        expect(setSpy).toHaveBeenCalledWith({ test: testObj }, key);
      });

      it("should update an existing session", async () => {
        const existingObj = { test: testObj };
        jest.spyOn(sut, "getLocalSession").mockResolvedValue(existingObj);
        await sut.save("test2", testObj);

        expect(setSpy).toHaveBeenCalledWith({ test2: testObj, ...existingObj }, key);
      });

      it("should overwrite an existing item in session", async () => {
        const existingObj = { test: {} };
        jest.spyOn(sut, "getLocalSession").mockResolvedValue(existingObj);
        await sut.save("test", testObj);

        expect(setSpy).toHaveBeenCalledWith({ test: testObj }, key);
      });
    });
  });

  describe("getSessionKey", () => {
    beforeEach(() => {
      getSessionKeySpy.mockRestore();
    });

    it("should return the stored symmetric crypto key", async () => {
      sessionStorageService.get.mockResolvedValue({ ...key });
      const result = await sut.getSessionEncKey();

      expect(result).toStrictEqual(key);
    });

    describe("new key creation", () => {
      beforeEach(() => {
        keyGenerationService.createKeyWithPurpose.mockResolvedValue({
          salt: "salt",
          material: null,
          derivedKey: key,
        });
        jest.spyOn(sut, "setSessionEncKey").mockResolvedValue();
      });

      it("should create a symmetric crypto key", async () => {
        const result = await sut.getSessionEncKey();

        expect(result).toStrictEqual(key);
        expect(keyGenerationService.createKeyWithPurpose).toHaveBeenCalledTimes(1);
      });

      it("should store a symmetric crypto key if it makes one", async () => {
        const spy = jest.spyOn(sut, "setSessionEncKey").mockResolvedValue();
        await sut.getSessionEncKey();

        expect(spy).toHaveBeenCalledWith(key);
      });
    });
  });

  describe("getLocalSession", () => {
    it("should return null if session is null", async () => {
      const result = await sut.getLocalSession(key);

      expect(result).toBeNull();
      expect(localStorageService.get).toHaveBeenCalledWith("session_test");
    });

    describe("non-null sessions", () => {
      const session = { test: "test" };
      const encSession = new EncString(JSON.stringify(session));
      const decryptedSession = JSON.stringify(session);

      beforeEach(() => {
        localStorageService.get.mockResolvedValue(encSession.encryptedString);
      });

      it("should decrypt returned sessions", async () => {
        encryptService.decryptToUtf8
          .calledWith(expect.anything(), key)
          .mockResolvedValue(decryptedSession);
        await sut.getLocalSession(key);
        expect(encryptService.decryptToUtf8).toHaveBeenNthCalledWith(1, encSession, key);
      });

      it("should parse session", async () => {
        encryptService.decryptToUtf8
          .calledWith(expect.anything(), key)
          .mockResolvedValue(decryptedSession);
        const result = await sut.getLocalSession(key);
        expect(result).toEqual(session);
      });

      it("should remove state if decryption fails", async () => {
        encryptService.decryptToUtf8.mockResolvedValue(null);
        const setSessionEncKeySpy = jest.spyOn(sut, "setSessionEncKey").mockResolvedValue();

        const result = await sut.getLocalSession(key);

        expect(result).toBeNull();
        expect(setSessionEncKeySpy).toHaveBeenCalledWith(null);
        expect(localStorageService.remove).toHaveBeenCalledWith("session_test");
      });
    });
  });

  describe("setLocalSession", () => {
    const testSession = { test: "a" };
    const testJSON = JSON.stringify(testSession);

    it("should encrypt a stringified session", async () => {
      encryptService.encrypt.mockImplementation(mockEnc);
      localStorageService.save.mockResolvedValue();
      await sut.setLocalSession(testSession, key);

      expect(encryptService.encrypt).toHaveBeenNthCalledWith(1, testJSON, key);
    });

    it("should remove local session if null", async () => {
      encryptService.encrypt.mockResolvedValue(null);
      await sut.setLocalSession(null, key);

      expect(localStorageService.remove).toHaveBeenCalledWith("session_test");
    });

    it("should save encrypted string", async () => {
      encryptService.encrypt.mockImplementation(mockEnc);
      await sut.setLocalSession(testSession, key);

      expect(localStorageService.save).toHaveBeenCalledWith(
        "session_test",
        (await mockEnc(testJSON)).encryptedString,
      );
    });
  });

  describe("setSessionKey", () => {
    it("should remove if null", async () => {
      await sut.setSessionEncKey(null);
      expect(sessionStorageService.remove).toHaveBeenCalledWith("localEncryptionKey_test");
    });

    it("should save key when not null", async () => {
      await sut.setSessionEncKey(key);
      expect(sessionStorageService.save).toHaveBeenCalledWith("localEncryptionKey_test", key);
    });
  });
});
