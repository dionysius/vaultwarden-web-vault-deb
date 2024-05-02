import { ConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/platform/services/cryptography/multithread-encrypt.service.implementation";
import { WebCryptoFunctionService } from "@bitwarden/common/platform/services/web-crypto-function.service";

import { BrowserApi } from "../browser/browser-api";
import BrowserClipboardService from "../services/browser-clipboard.service";

import {
  OffscreenDocument as OffscreenDocumentInterface,
  OffscreenDocumentExtensionMessage,
  OffscreenDocumentExtensionMessageHandlers,
} from "./abstractions/offscreen-document";

class OffscreenDocument implements OffscreenDocumentInterface {
  private readonly consoleLogService: ConsoleLogService;
  private encryptService: MultithreadEncryptServiceImplementation;
  private readonly extensionMessageHandlers: OffscreenDocumentExtensionMessageHandlers = {
    offscreenCopyToClipboard: ({ message }) => this.handleOffscreenCopyToClipboard(message),
    offscreenReadFromClipboard: () => this.handleOffscreenReadFromClipboard(),
    offscreenDecryptItems: ({ message }) => this.handleOffscreenDecryptItems(message),
  };

  constructor() {
    const cryptoFunctionService = new WebCryptoFunctionService(self);
    this.consoleLogService = new ConsoleLogService(false);
    this.encryptService = new MultithreadEncryptServiceImplementation(
      cryptoFunctionService,
      this.consoleLogService,
      true,
    );
  }

  /**
   * Initializes the offscreen document extension.
   */
  init() {
    this.setupExtensionMessageListener();
  }

  /**
   * Copies the given text to the user's clipboard.
   *
   * @param message - The extension message containing the text to copy
   */
  private async handleOffscreenCopyToClipboard(message: OffscreenDocumentExtensionMessage) {
    await BrowserClipboardService.copy(self, message.text);
  }

  /**
   * Reads the user's clipboard and returns the text.
   */
  private async handleOffscreenReadFromClipboard() {
    return await BrowserClipboardService.read(self);
  }

  /**
   * Decrypts the items in the message using the encrypt service.
   *
   * @param message - The extension message containing the items to decrypt
   */
  private async handleOffscreenDecryptItems(
    message: OffscreenDocumentExtensionMessage,
  ): Promise<string> {
    const { decryptRequest } = message;
    if (!decryptRequest) {
      return "[]";
    }

    const request = JSON.parse(decryptRequest);
    return await this.encryptService.getDecryptedItemsFromWorker(request.items, request.key);
  }

  /**
   * Sets up the listener for extension messages.
   */
  private setupExtensionMessageListener() {
    BrowserApi.messageListener("offscreen-document", this.handleExtensionMessage);
  }

  /**
   * Handles extension messages sent to the extension background.
   *
   * @param message - The message received from the extension
   * @param sender - The sender of the message
   * @param sendResponse - The response to send back to the sender
   */
  private handleExtensionMessage = (
    message: OffscreenDocumentExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    const handler: CallableFunction | undefined = this.extensionMessageHandlers[message?.command];
    if (!handler) {
      return;
    }

    const messageResponse = handler({ message, sender });
    if (!messageResponse) {
      return;
    }

    Promise.resolve(messageResponse)
      .then((response) => sendResponse(response))
      .catch((error) =>
        this.consoleLogService.error("Error resolving extension message response", error),
      );
    return true;
  };
}

(() => {
  const offscreenDocument = new OffscreenDocument();
  offscreenDocument.init();
})();
