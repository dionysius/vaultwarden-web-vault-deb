import { setupExtensionDisconnectAction } from "../utils";

import ContentMessageHandler from "./content-message-handler";

(function (windowContext) {
  if (!windowContext.bitwardenContentMessageHandler) {
    windowContext.bitwardenContentMessageHandler = new ContentMessageHandler();
    setupExtensionDisconnectAction(() => windowContext.bitwardenContentMessageHandler.destroy());

    windowContext.bitwardenContentMessageHandler.init();
  }
})(window);
