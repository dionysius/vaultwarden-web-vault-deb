import { postWindowMessage, sendExtensionRuntimeMessage } from "../jest/testing-utils";

import ContentMessageHandler from "./content-message-handler";

describe("ContentMessageHandler", () => {
  let contentMessageHandler: ContentMessageHandler;
  const sendMessageSpy = jest.spyOn(chrome.runtime, "sendMessage");

  beforeEach(() => {
    contentMessageHandler = new ContentMessageHandler();
  });

  afterEach(() => {
    jest.clearAllMocks();
    contentMessageHandler.destroy();
  });

  describe("init", () => {
    it("should add event listeners", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");
      const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, "addListener");

      contentMessageHandler.init();

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleWindowMessage", () => {
    beforeEach(() => {
      contentMessageHandler.init();
    });

    it("ignores messages from other sources", () => {
      postWindowMessage({ command: "authResult" }, "https://localhost/", null);

      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it("ignores messages without a command", () => {
      postWindowMessage({});

      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it("sends an authResult message", () => {
      postWindowMessage({ command: "authResult", lastpass: true, code: "code", state: "state" });

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({
        command: "authResult",
        code: "code",
        state: "state",
        lastpass: true,
        referrer: "localhost",
      });
    });

    it("sends a webAuthnResult message", () => {
      postWindowMessage({ command: "webAuthnResult", data: "data", remember: true });

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({
        command: "webAuthnResult",
        data: "data",
        remember: true,
        referrer: "localhost",
      });
    });
  });

  describe("handleExtensionMessage", () => {
    beforeEach(() => {
      contentMessageHandler.init();
    });

    it("ignores the message to the extension background if it is not present in the forwardCommands list", () => {
      sendExtensionRuntimeMessage({ command: "someOtherCommand" });

      expect(sendMessageSpy).not.toHaveBeenCalled();
    });

    it("forwards the message to the extension background if it is present in the forwardCommands list", () => {
      sendExtensionRuntimeMessage({ command: "bgUnlockPopoutOpened" });

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({ command: "bgUnlockPopoutOpened" });
    });
  });
});
