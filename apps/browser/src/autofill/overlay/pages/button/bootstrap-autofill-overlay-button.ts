import { AutofillOverlayElement } from "../../../utils/autofill-overlay.enum";

import AutofillOverlayButton from "./autofill-overlay-button";

require("./button.scss");

(function () {
  globalThis.customElements.define(AutofillOverlayElement.Button, AutofillOverlayButton);
})();
