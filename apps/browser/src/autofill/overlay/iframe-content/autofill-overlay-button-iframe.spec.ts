import AutofillOverlayButtonIframe from "./autofill-overlay-button-iframe";
import AutofillOverlayIframeElement from "./autofill-overlay-iframe-element";

describe("AutofillOverlayButtonIframe", () => {
  window.customElements.define("autofill-overlay-button-iframe", AutofillOverlayButtonIframe);

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("creates a custom element that is an instance of the AutofillIframeElement parent class", () => {
    document.body.innerHTML = "<autofill-overlay-button-iframe></autofill-overlay-button-iframe>";

    const iframe = document.querySelector("autofill-overlay-button-iframe");

    expect(iframe).toBeInstanceOf(AutofillOverlayButtonIframe);
    expect(iframe).toBeInstanceOf(AutofillOverlayIframeElement);
  });
});
