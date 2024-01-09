import { setupExtensionDisconnectAction } from "../utils";

import ContentMessageHandler from "./content-message-handler";

(function (windowContext) {
  // eslint-disable-next-line no-console -- In content script
  console.debug("Initializing bitwardenContentMessageHandler");
  if (!windowContext.bitwardenContentMessageHandler) {
    windowContext.bitwardenContentMessageHandler = new ContentMessageHandler();
    setupExtensionDisconnectAction(() => {
      // eslint-disable-next-line no-console -- In content script
      console.debug("Disconnecting content message handler.");
      windowContext.bitwardenContentMessageHandler.destroy();
    });

    windowContext.bitwardenContentMessageHandler.init();
  }
})(window);
