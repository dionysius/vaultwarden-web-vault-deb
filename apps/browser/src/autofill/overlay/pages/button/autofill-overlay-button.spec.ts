import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import { createInitAutofillOverlayButtonMessageMock } from "../../../jest/autofill-mocks";
import { postWindowMessage } from "../../../jest/testing-utils";

import AutofillOverlayButton from "./autofill-overlay-button";

describe("AutofillOverlayButton", () => {
  globalThis.customElements.define("autofill-overlay-button", AutofillOverlayButton);

  let autofillOverlayButton: AutofillOverlayButton;

  beforeEach(() => {
    document.body.innerHTML = `<autofill-overlay-button></autofill-overlay-button>`;
    autofillOverlayButton = document.querySelector("autofill-overlay-button");
    autofillOverlayButton["messageOrigin"] = "https://localhost/";
    jest.spyOn(globalThis.document, "createElement");
    jest.spyOn(globalThis.parent, "postMessage");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initAutofillOverlayButton", () => {
    it("creates the button element with the locked icon when the user's auth status is not Unlocked", () => {
      postWindowMessage(
        createInitAutofillOverlayButtonMessageMock({ authStatus: AuthenticationStatus.Locked }),
      );

      expect(autofillOverlayButton["buttonElement"]).toMatchSnapshot();
      expect(autofillOverlayButton["buttonElement"].querySelector("svg")).toBe(
        autofillOverlayButton["logoLockedIconElement"],
      );
    });

    it("creates the button element with the normal icon when the user's auth status is Unlocked ", () => {
      postWindowMessage(createInitAutofillOverlayButtonMessageMock());

      expect(autofillOverlayButton["buttonElement"]).toMatchSnapshot();
      expect(autofillOverlayButton["buttonElement"].querySelector("svg")).toBe(
        autofillOverlayButton["logoIconElement"],
      );
    });

    it("posts a message to the background indicating that the icon was clicked", () => {
      postWindowMessage(createInitAutofillOverlayButtonMessageMock());
      autofillOverlayButton["buttonElement"].click();

      expect(globalThis.parent.postMessage).toHaveBeenCalledWith(
        { command: "overlayButtonClicked" },
        "https://localhost/",
      );
    });
  });

  describe("global event listeners", () => {
    beforeEach(() => {
      postWindowMessage(createInitAutofillOverlayButtonMessageMock());
    });

    it("does not post a message to close the autofill overlay if the element is focused during the focus check", () => {
      jest.spyOn(globalThis.document, "hasFocus").mockReturnValue(true);

      postWindowMessage({ command: "checkAutofillOverlayButtonFocused" });

      expect(globalThis.parent.postMessage).not.toHaveBeenCalled();
    });

    it("posts a message to close the autofill overlay if the element is not focused during the focus check", () => {
      jest.spyOn(globalThis.document, "hasFocus").mockReturnValue(false);

      postWindowMessage({ command: "checkAutofillOverlayButtonFocused" });

      expect(globalThis.parent.postMessage).toHaveBeenCalledWith(
        { command: "closeAutofillOverlay" },
        "https://localhost/",
      );
    });

    it("updates the user's auth status", () => {
      autofillOverlayButton["authStatus"] = AuthenticationStatus.Locked;

      postWindowMessage({
        command: "updateAutofillOverlayButtonAuthStatus",
        authStatus: AuthenticationStatus.Unlocked,
      });

      expect(autofillOverlayButton["authStatus"]).toBe(AuthenticationStatus.Unlocked);
    });
  });
});
