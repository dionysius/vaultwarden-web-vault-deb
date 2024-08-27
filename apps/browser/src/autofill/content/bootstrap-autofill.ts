import { DomQueryService } from "../services/dom-query.service";
import { setupAutofillInitDisconnectAction } from "../utils";

import AutofillInit from "./autofill-init";

(function (windowContext) {
  if (!windowContext.bitwardenAutofillInit) {
    const domQueryService = new DomQueryService();
    windowContext.bitwardenAutofillInit = new AutofillInit(domQueryService);
    setupAutofillInitDisconnectAction(windowContext);

    windowContext.bitwardenAutofillInit.init();
  }
})(window);
