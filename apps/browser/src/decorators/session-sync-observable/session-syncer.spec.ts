import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { BrowserApi } from "../../browser/browserApi";
import { StateService } from "../../services/abstractions/state.service";

import { SessionSyncer } from "./session-syncer";

describe("session syncer", () => {
  const propertyKey = "behaviorSubject";
  const sessionKey = "Test__" + propertyKey;
  const metaData = { propertyKey, sessionKey, initializer: (s: string) => s };
  let stateService: MockProxy<StateService>;
  let sut: SessionSyncer;
  let behaviorSubject: BehaviorSubject<string>;

  beforeEach(() => {
    behaviorSubject = new BehaviorSubject<string>("");
    jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
      name: "bitwarden-test",
      version: "0.0.0",
      manifest_version: 3,
    });

    stateService = mock<StateService>();
    sut = new SessionSyncer(behaviorSubject, stateService, metaData);
  });

  afterEach(() => {
    jest.resetAllMocks();

    behaviorSubject.complete();
  });

  describe("constructor", () => {
    it("should throw if behaviorSubject is not an instance of BehaviorSubject", () => {
      expect(() => {
        new SessionSyncer({} as any, stateService, null);
      }).toThrowError("behaviorSubject must be an instance of BehaviorSubject");
    });

    it("should create if either ctor or initializer is provided", () => {
      expect(
        new SessionSyncer(behaviorSubject, stateService, { propertyKey, sessionKey, ctor: String })
      ).toBeDefined();
      expect(
        new SessionSyncer(behaviorSubject, stateService, {
          propertyKey,
          sessionKey,
          initializer: (s: any) => s,
        })
      ).toBeDefined();
    });
    it("should throw if neither ctor or initializer is provided", () => {
      expect(() => {
        new SessionSyncer(behaviorSubject, stateService, { propertyKey, sessionKey });
      }).toThrowError("ctor or initializer must be provided");
    });
  });

  describe("manifest v2 init", () => {
    let observeSpy: jest.SpyInstance;
    let listenForUpdatesSpy: jest.SpyInstance;

    beforeEach(() => {
      observeSpy = jest.spyOn(behaviorSubject, "subscribe").mockReturnThis();
      listenForUpdatesSpy = jest.spyOn(BrowserApi, "messageListener").mockReturnValue();
      jest.spyOn(chrome.runtime, "getManifest").mockReturnValue({
        name: "bitwarden-test",
        version: "0.0.0",
        manifest_version: 2,
      });

      sut.init();
    });

    it("should not start observing", () => {
      expect(observeSpy).not.toHaveBeenCalled();
    });

    it("should not start listening", () => {
      expect(listenForUpdatesSpy).not.toHaveBeenCalled();
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
      stateService.getFromSessionMemory.mockResolvedValue("test");

      await sut.updateFromMessage({ command: `${sessionKey}_update`, id: "different_id" });

      expect(stateService.getFromSessionMemory).toHaveBeenCalledTimes(1);
      expect(stateService.getFromSessionMemory).toHaveBeenCalledWith(sessionKey);

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith("test");
      expect(behaviorSubject.value).toBe("test");

      // Expect no circular messaging
      expect(sendMessageSpy).toHaveBeenCalledTimes(0);
    });
  });
});
