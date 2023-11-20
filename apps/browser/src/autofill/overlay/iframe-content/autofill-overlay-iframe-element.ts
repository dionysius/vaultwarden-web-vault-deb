import AutofillOverlayIframeService from "./autofill-overlay-iframe.service";

class AutofillOverlayIframeElement extends HTMLElement {
  constructor(
    iframePath: string,
    portName: string,
    initStyles: Partial<CSSStyleDeclaration>,
    iframeTitle: string,
    ariaAlert?: string
  ) {
    super();

    const shadow: ShadowRoot = this.attachShadow({ mode: "closed" });
    const autofillOverlayIframeService = new AutofillOverlayIframeService(
      iframePath,
      portName,
      shadow
    );
    autofillOverlayIframeService.initOverlayIframe(initStyles, iframeTitle, ariaAlert);
  }
}

export default AutofillOverlayIframeElement;
