import { awaitAsync } from "@bitwarden/common/../spec/utils";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, ReplaySubject } from "rxjs";

import { MemoryStorageService } from "@bitwarden/common/platform/services/memory-storage.service";

import { BrowserApi } from "../../browser/browser-api";

import { SessionSyncer } from "./session-syncer";
import { SyncedItemMetadata } from "./sync-item-metadata";

describe("session syncer", () => {
  const propertyKey = "behaviorSubject";
  const sessionKey = "Test__" + propertyKey;
  const metaData: SyncedItemMetadata = {
    propertyKey,
    sessionKey,
    initializer: (s: string) => s,
    initializeAs: "object",
  };
  let storageService: MockProxy<MemoryStorageService>;
  let sut: SessionSyncer;
  let behaviorSubject: BehaviorSubject<string>;

  beforeEach(() => {
    behaviorSubject = new BehaviorSubject<string>("");
    jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
      name: "bitwarden-test",
      version: "0.0.0",
      manifest_version: 3,
    });

    storageService = mock();
    storageService.has.mockResolvedValue(false);
    sut = new SessionSyncer(behaviorSubject, storageService, metaData);
  });

  afterEach(() => {
    jest.resetAllMocks();

    behaviorSubject.complete();
  });

  describe("constructor", () => {
    it("should throw if subject is not an instance of Subject", () => {
      expect(() => {
        new SessionSyncer({} as any, storageService, null);
      }).toThrowError("subject must inherit from Subject");
    });

    it("should create if either ctor or initializer is provided", () => {
      expect(
        new SessionSyncer(behaviorSubject, storageService, {
          propertyKey,
          sessionKey,
          initializeAs: "object",
          initializer: () => null,
        }),
      ).toBeDefined();
      expect(
        new SessionSyncer(behaviorSubject, storageService, {
          propertyKey,
          sessionKey,
          initializer: (s: any) => s,
          initializeAs: "object",
        }),
      ).toBeDefined();
    });
    it("should throw if neither ctor or initializer is provided", () => {
      expect(() => {
        new SessionSyncer(behaviorSubject, storageService, {
          propertyKey,
          sessionKey,
          initializeAs: "object",
          initializer: null,
        });
      }).toThrowError("initializer must be provided");
    });
  });

  describe("init", () => {
    it("should ignore all updates currently in a ReplaySubject's buffer", () => {
      const replaySubject = new ReplaySubject<string>(Infinity);
      replaySubject.next("1");
      replaySubject.next("2");
      replaySubject.next("3");
      sut = new SessionSyncer(replaySubject, storageService, metaData);
      // block observing the subject
      jest.spyOn(sut as any, "observe").mockImplementation();

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();

      expect(sut["ignoreNUpdates"]).toBe(3);
    });

    it("should ignore BehaviorSubject's initial value", () => {
      const behaviorSubject = new BehaviorSubject<string>("initial");
      sut = new SessionSyncer(behaviorSubject, storageService, metaData);
      // block observing the subject
      jest.spyOn(sut as any, "observe").mockImplementation();

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();

      expect(sut["ignoreNUpdates"]).toBe(1);
    });

    it("should grab an initial value from storage if it exists", async () => {
      storageService.has.mockResolvedValue(true);
      //Block a call to update
      const updateSpy = jest.spyOn(sut as any, "updateFromMemory").mockImplementation();

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();
      await awaitAsync();

      expect(updateSpy).toHaveBeenCalledWith();
    });

    it("should not grab an initial value from storage if it does not exist", async () => {
      storageService.has.mockResolvedValue(false);
      //Block a call to update
      const updateSpy = jest.spyOn(sut as any, "update").mockImplementation();

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();
      await awaitAsync();

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe("a value is emitted on the observable", () => {
    let sendMessageSpy: jest.SpyInstance;
    const value = "test";
    const serializedValue = JSON.stringify(value);

    beforeEach(() => {
      sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();

      behaviorSubject.next(value);
    });

    it("should update sessionSyncers in other contexts", async () => {
      // await finishing of fire-and-forget operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith(`${sessionKey}_update`, {
        id: sut.id,
        serializedValue,
      });
    });
  });

  describe("A message is received", () => {
    let nextSpy: jest.SpyInstance;
    let sendMessageSpy: jest.SpyInstance;

    beforeEach(() => {
      nextSpy = jest.spyOn(behaviorSubject, "next");
      sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should ignore messages with the wrong command", async () => {
      await sut.updateFromMessage({ command: "wrong_command", id: sut.id });

      expect(storageService.getBypassCache).not.toHaveBeenCalled();
      expect(nextSpy).not.toHaveBeenCalled();
    });

    it("should ignore messages from itself", async () => {
      await sut.updateFromMessage({ command: `${sessionKey}_update`, id: sut.id });

      expect(storageService.getBypassCache).not.toHaveBeenCalled();
      expect(nextSpy).not.toHaveBeenCalled();
    });

    it("should update from message on emit from another instance", async () => {
      const builder = jest.fn();
      jest.spyOn(SyncedItemMetadata, "builder").mockReturnValue(builder);
      const value = "test";
      const serializedValue = JSON.stringify(value);
      builder.mockReturnValue(value);

      // Expect no circular messaging
      await awaitAsync();
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);

      await sut.updateFromMessage({
        command: `${sessionKey}_update`,
        id: "different_id",
        serializedValue,
      });
      await awaitAsync();

      expect(storageService.getBypassCache).toHaveBeenCalledTimes(0);

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith(value);
      expect(behaviorSubject.value).toBe(value);

      // Expect no circular messaging
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("memory storage", () => {
    const value = "test";
    const serializedValue = JSON.stringify(value);
    let saveSpy: jest.SpyInstance;
    const builder = jest.fn().mockReturnValue(value);
    const manifestVersionSpy = jest.spyOn(BrowserApi, "manifestVersion", "get");
    const isBackgroundPageSpy = jest.spyOn(BrowserApi, "isBackgroundPage");

    beforeEach(async () => {
      jest.spyOn(SyncedItemMetadata, "builder").mockReturnValue(builder);
      saveSpy = jest.spyOn(storageService, "save");

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sut.init();
      await awaitAsync();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should always store on observed next for manifest version 3", async () => {
      manifestVersionSpy.mockReturnValue(3);
      isBackgroundPageSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);
      behaviorSubject.next(value);
      await awaitAsync();
      behaviorSubject.next(value);
      await awaitAsync();

      expect(saveSpy).toHaveBeenCalledTimes(2);
    });

    it("should not store on message receive for manifest version 3", async () => {
      manifestVersionSpy.mockReturnValue(3);
      isBackgroundPageSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);
      await sut.updateFromMessage({
        command: `${sessionKey}_update`,
        id: "different_id",
        serializedValue,
      });
      await awaitAsync();

      expect(saveSpy).toHaveBeenCalledTimes(0);
    });

    it("should store on message receive for manifest version 2 for background page only", async () => {
      manifestVersionSpy.mockReturnValue(2);
      isBackgroundPageSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);
      await sut.updateFromMessage({
        command: `${sessionKey}_update`,
        id: "different_id",
        serializedValue,
      });
      await awaitAsync();
      await sut.updateFromMessage({
        command: `${sessionKey}_update`,
        id: "different_id",
        serializedValue,
      });
      await awaitAsync();

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it("should store on observed next for manifest version 2 for background page only", async () => {
      manifestVersionSpy.mockReturnValue(2);
      isBackgroundPageSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);
      behaviorSubject.next(value);
      await awaitAsync();
      behaviorSubject.next(value);
      await awaitAsync();

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
