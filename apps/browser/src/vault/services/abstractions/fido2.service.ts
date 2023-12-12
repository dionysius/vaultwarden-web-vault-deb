export abstract class Fido2Service {
  init: () => Promise<void>;
  injectFido2ContentScripts: (sender: chrome.runtime.MessageSender) => Promise<void>;
}
