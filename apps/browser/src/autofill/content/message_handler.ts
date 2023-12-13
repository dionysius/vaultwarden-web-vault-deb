import { setupExtensionDisconnectAction } from "../utils";

const forwardCommands = [
  "bgUnlockPopoutOpened",
  "addToLockedVaultPendingNotifications",
  "unlockCompleted",
  "addedCipher",
];

/**
 * Handles sending extension messages to the background
 * script based on window messages from the page.
 *
 * @param event - Window message event
 */
const handleWindowMessage = (event: MessageEvent) => {
  if (event.source !== window) {
    return;
  }

  if (event.data.command && event.data.command === "authResult") {
    chrome.runtime.sendMessage({
      command: event.data.command,
      code: event.data.code,
      state: event.data.state,
      lastpass: event.data.lastpass,
      referrer: event.source.location.hostname,
    });
  }

  if (event.data.command && event.data.command === "webAuthnResult") {
    chrome.runtime.sendMessage({
      command: event.data.command,
      data: event.data.data,
      remember: event.data.remember,
      referrer: event.source.location.hostname,
    });
  }
};

/**
 * Handles forwarding any commands that need to trigger
 * an action from one service of the extension background
 * to another.
 *
 * @param message - Message from the extension
 */
const handleExtensionMessage = (message: any) => {
  if (forwardCommands.includes(message.command)) {
    chrome.runtime.sendMessage(message);
  }
};

/**
 * Handles cleaning up any event listeners that were
 * added to the window or extension.
 */
const handleExtensionDisconnect = () => {
  window.removeEventListener("message", handleWindowMessage);
  chrome.runtime.onMessage.removeListener(handleExtensionMessage);
};

window.addEventListener("message", handleWindowMessage, false);
chrome.runtime.onMessage.addListener(handleExtensionMessage);
setupExtensionDisconnectAction(handleExtensionDisconnect);
