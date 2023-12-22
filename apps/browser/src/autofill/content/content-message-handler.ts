import { ContentMessageHandler as ContentMessageHandlerInterface } from "./abstractions/content-message-handler";

class ContentMessageHandler implements ContentMessageHandlerInterface {
  private forwardCommands = [
    "bgUnlockPopoutOpened",
    "addToLockedVaultPendingNotifications",
    "unlockCompleted",
    "addedCipher",
  ];

  /**
   * Initialize the content message handler. Sets up
   * a window message listener and a chrome runtime
   * message listener.
   */
  init() {
    window.addEventListener("message", this.handleWindowMessage, false);
    chrome.runtime.onMessage.addListener(this.handleExtensionMessage);
  }

  /**
   * Handle a message from the window. This implementation
   * specifically handles the authResult and webAuthnResult
   * commands. This facilitates single sign-on.
   *
   * @param event - The message event.
   */
  private handleWindowMessage = (event: MessageEvent) => {
    const { source, data } = event;

    if (source !== window || !data?.command) {
      return;
    }

    const { command } = data;
    const referrer = source.location.hostname;

    if (command === "authResult") {
      const { lastpass, code, state } = data;
      chrome.runtime.sendMessage({ command, code, state, lastpass, referrer });
    }

    if (command === "webAuthnResult") {
      const { remember } = data;
      chrome.runtime.sendMessage({ command, data: data.data, remember, referrer });
    }
  };

  /**
   * Handle a message from the extension. This
   * implementation forwards the message to the
   * extension background so that it can  be received
   * in other contexts of the background script.
   *
   * @param message - The message from the extension.
   */
  private handleExtensionMessage = (message: any) => {
    if (this.forwardCommands.includes(message.command)) {
      chrome.runtime.sendMessage(message);
    }
  };

  /**
   * Destroy the content message handler. Removes
   * the window message listener and the chrome
   * runtime message listener.
   */
  destroy = () => {
    window.removeEventListener("message", this.handleWindowMessage);
    chrome.runtime.onMessage.removeListener(this.handleExtensionMessage);
  };
}

export default ContentMessageHandler;
