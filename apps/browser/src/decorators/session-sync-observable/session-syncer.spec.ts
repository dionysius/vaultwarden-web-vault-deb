import { awaitAsync as flushAsyncObservables } from "@bitwarden/angular/../test-utils";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, ReplaySubject } from "rxjs";

import { BrowserApi } from "../../browser/browserApi";
import { BrowserStateService } from "../../services/abstractions/browser-state.service";

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
  let stateService: MockProxy<BrowserStateService>;
  let sut: SessionSyncer;
  let behaviorSubject: BehaviorSubject<string>;

  beforeEach(() => {
    behaviorSubject = new BehaviorSubject<string>("");
    jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
      name: "bitwarden-test",
      version: "0.0.0",
      manifest_version: 3,
    });

    stateService = mock<BrowserStateService>();
    sut = new SessionSyncer(behaviorSubject, stateService, metaData);
  });

  afterEach(() => {
    jest.resetAllMocks();

    behaviorSubject.complete();
  });

  describe("constructor", () => {
    it("should throw if subject is not an instance of Subject", () => {
      expect(() => {
        new SessionSyncer({} as any, stateService, null);
      }).toThrowError("subject must inherit from Subject");
    });

    it("should create if either ctor or initializer is provided", () => {
      expect(
        new SessionSyncer(behaviorSubject, stateService, {
          propertyKey,
          sessionKey,
          ctor: String,
          initializeAs: "object",
        })
      ).toBeDefined();
      expect(
        new SessionSyncer(behaviorSubject, stateService, {
          propertyKey,
          sessionKey,
          initializer: (s: any) => s,
          initializeAs: "object",
        })
      ).toBeDefined();
    });
    it("should throw if neither ctor or initializer is provided", () => {
      expect(() => {
        new SessionSyncer(behaviorSubject, stateService, {
          propertyKey,
          sessionKey,
          initializeAs: "object",
        });
      }).toThrowError("ctor or initializer must be provided");
    });
  });

  describe("init", () => {
    it("should ignore all updates currently in a ReplaySubject's buffer", () => {
      const replaySubject = new ReplaySubject<string>(Infinity);
      replaySubject.next("1");
      replaySubject.next("2");
      replaySubject.next("3");
      sut = new SessionSyncer(replaySubject, stateService, metaData);
      // block observing the subject
      jest.spyOn(sut as any, "observe").mockImplementation();

      sut.init();

      expect(sut["ignoreNUpdates"]).toBe(3);
    });

    it("should ignore BehaviorSubject's initial value", () => {
      const behaviorSubject = new BehaviorSubject<string>("initial");
      sut = new SessionSyncer(behaviorSubject, stateService, metaData);
      // block observing the subject
      jest.spyOn(sut as any, "observe").mockImplementation();

      sut.init();

      expect(sut["ignoreNUpdates"]).toBe(1);
    });

    it("should grab an initial value from storage if it exists", () => {
      stateService.hasInSessionMemory.mockResolvedValue(true);
      //Block a call to update
      const updateSpy = jest.spyOn(sut as any, "update").mockImplementation();

      sut.init();

      expect(updateSpy).toHaveBeenCalledWith();
    });

    it("should not grab an initial value from storage if it does not exist", () => {
      stateService.hasInSessionMemory.mockResolvedValue(false);
      //Block a call to update
      const updateSpy = jest.spyOn(sut as any, "update").mockImplementation();

      sut.init();

      expect(updateSpy).toHaveBeenCalledWith();
    });
  });

  describe("a value is emitted on the observable", () => {
    let sendMessageSpy: jest.SpyInstance;

    beforeEach(() => {
      sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

      sut.init();

      behaviorSubject.next("test");
    });

    it("should update the session memory", async () => {
      // await finishing of fire-and-forget operation
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(stateService.setInSessionMemory).toHaveBeenCalledTimes(1);
      expect(stateService.setInSessionMemory).toHaveBeenCalledWith(sessionKey, "test");
    });

    it("should update sessionSyncers in other contexts", async () => {
      // await finishing of fire-and-forget operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith(`${sessionKey}_update`, { id: sut.id });
    });
  });

  describe("A message is received", () => {
    let nextSpy: jest.SpyInstance;
    let sendMessageSpy: jest.SpyInstance;

    beforeEach(() => {
      nextSpy = jest.spyOn(behaviorSubject, "next");
      sendMessageSpy = jest.spyOn(BrowserApi, "sendMessage");

      sut.init();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should ignore messages with the wrong command", async () => {
      await sut.updateFromMessage({ command: "wrong_command", id: sut.id });

      expect(stateService.getFromSessionMemory).not.toHaveBeenCalled();
      expect(nextSpy).not.toHaveBeenCalled();
    });

    it("should ignore messages from itself", async () => {
      await sut.updateFromMessage({ command: `${sessionKey}_update`, id: sut.id });

      expect(stateService.getFromSessionMemory).not.toHaveBeenCalled();
      expect(nextSpy).not.toHaveBeenCalled();
    });

    it("should update from message on emit from another instance", async () => {
      const builder = jest.fn();
      jest.spyOn(SyncedItemMetadata, "builder").mockReturnValue(builder);
      stateService.getFromSessionMemory.mockResolvedValue("test");

      await sut.updateFromMessage({ command: `${sessionKey}_update`, id: "different_id" });
      await flushAsyncObservables();

      expect(stateService.getFromSessionMemory).toHaveBeenCalledTimes(1);
      expect(stateService.getFromSessionMemory).toHaveBeenCalledWith(sessionKey, builder);

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith("test");
      expect(behaviorSubject.value).toBe("test");

      // Expect no circular messaging
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });
});
