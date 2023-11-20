import AutofillOverlayIframeElement from "./autofill-overlay-iframe-element";
import AutofillOverlayListIframe from "./autofill-overlay-list-iframe";

describe("AutofillOverlayListIframe", () => {
  window.customElements.define("autofill-overlay-list-iframe", AutofillOverlayListIframe);

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("creates a custom element that is an instance of the AutofillIframeElement parent class", () => {
    document.body.innerHTML = "<autofill-overlay-list-iframe></autofill-overlay-list-iframe>";

    const iframe = document.querySelector("autofill-overlay-list-iframe");

    expect(iframe).toBeInstanceOf(AutofillOverlayListIframe);
    expect(iframe).toBeInstanceOf(AutofillOverlayIframeElement);
  });
});
