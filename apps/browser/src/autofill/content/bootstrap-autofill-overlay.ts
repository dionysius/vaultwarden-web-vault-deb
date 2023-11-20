import AutofillOverlayContentService from "../services/autofill-overlay-content.service";

import AutofillInit from "./autofill-init";

(function (windowContext) {
  if (!windowContext.bitwardenAutofillInit) {
    const autofillOverlayContentService = new AutofillOverlayContentService();
    windowContext.bitwardenAutofillInit = new AutofillInit(autofillOverlayContentService);
    windowContext.bitwardenAutofillInit.init();
  }
})(window);
