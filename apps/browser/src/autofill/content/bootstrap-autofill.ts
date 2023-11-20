import AutofillInit from "./autofill-init";

(function (windowContext) {
  if (!windowContext.bitwardenAutofillInit) {
    windowContext.bitwardenAutofillInit = new AutofillInit();
    windowContext.bitwardenAutofillInit.init();
  }
})(window);
