import { mock } from "jest-mock-extended";

import { Decryptable } from "@bitwarden/common/platform/interfaces/decryptable.interface";
import { InitializerMetadata } from "@bitwarden/common/platform/interfaces/initializer-metadata.interface";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { flushPromises, sendExtensionRuntimeMessage } from "../../autofill/spec/testing-utils";
import { BrowserApi } from "../browser/browser-api";
import BrowserClipboardService from "../services/browser-clipboard.service";

jest.mock(
  "@bitwarden/common/platform/services/cryptography/multithread-encrypt.service.implementation",
  () => ({
    MultithreadEncryptServiceImplementation: class MultithreadEncryptServiceImplementation {
      getDecryptedItemsFromWorker = async <T extends InitializerMetadata>(
        items: Decryptable<T>[],
        _key: SymmetricCryptoKey,
      ): Promise<string> => JSON.stringify(items);
    },
  }),
);

describe("OffscreenDocument", () => {
  const browserApiMessageListenerSpy = jest.spyOn(BrowserApi, "messageListener");
  const browserClipboardServiceCopySpy = jest.spyOn(BrowserClipboardService, "copy");
  const browserClipboardServiceReadSpy = jest.spyOn(BrowserClipboardService, "read");
  const consoleErrorSpy = jest.spyOn(console, "error");

  require("../offscreen-document/offscreen-document");

  describe("init", () => {
    it("sets up a `chrome.runtime.onMessage` listener", () => {
      expect(browserApiMessageListenerSpy).toHaveBeenCalledWith(
        "offscreen-document",
        expect.any(Function),
      );
    });
  });

  describe("extension message handlers", () => {
    it("ignores messages that do not have a handler registered with the corresponding command", () => {
      sendExtensionRuntimeMessage({ command: "notAValidCommand" });

      expect(browserClipboardServiceCopySpy).not.toHaveBeenCalled();
      expect(browserClipboardServiceReadSpy).not.toHaveBeenCalled();
    });

    it("shows a console message if the handler throws an error", async () => {
      const error = new Error("test error");
      browserClipboardServiceCopySpy.mockRejectedValueOnce(new Error("test error"));

      sendExtensionRuntimeMessage({ command: "offscreenCopyToClipboard", text: "test" });
      await flushPromises();

      expect(browserClipboardServiceCopySpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error resolving extension message response",
        error,
      );
    });

    describe("handleOffscreenCopyToClipboard", () => {
      it("copies the message text", async () => {
        const text = "test";

        sendExtensionRuntimeMessage({ command: "offscreenCopyToClipboard", text });
        await flushPromises();

        expect(browserClipboardServiceCopySpy).toHaveBeenCalledWith(window, text);
      });
    });

    describe("handleOffscreenReadFromClipboard", () => {
      it("reads the value from the clipboard service", async () => {
        sendExtensionRuntimeMessage({ command: "offscreenReadFromClipboard" });
        await flushPromises();

        expect(browserClipboardServiceReadSpy).toHaveBeenCalledWith(window);
      });
    });

    describe("handleOffscreenDecryptItems", () => {
      it("returns an empty array as a string if the decrypt request is not present in the message", async () => {
        let response: string | undefined;
        sendExtensionRuntimeMessage(
          { command: "offscreenDecryptItems" },
          mock<chrome.runtime.MessageSender>(),
          (res: string) => (response = res),
        );
        await flushPromises();

        expect(response).toBe("[]");
      });

      it("decrypts the items and sends back the response as a string", async () => {
        const items = [{ id: "test" }];
        const key = { id: "test" };
        const decryptRequest = JSON.stringify({ items, key });
        let response: string | undefined;

        sendExtensionRuntimeMessage(
          { command: "offscreenDecryptItems", decryptRequest },
          mock<chrome.runtime.MessageSender>(),
          (res: string) => {
            response = res;
          },
        );
        await flushPromises();

        expect(response).toBe(JSON.stringify(items));
      });
    });
  });
});
