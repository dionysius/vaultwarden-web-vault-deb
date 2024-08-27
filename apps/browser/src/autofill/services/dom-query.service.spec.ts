import { mockQuerySelectorAllDefinedCall } from "../spec/testing-utils";

import { DomQueryService } from "./dom-query.service";

describe("DomQueryService", () => {
  let domQueryService: DomQueryService;
  let mutationObserver: MutationObserver;
  const mockQuerySelectorAll = mockQuerySelectorAllDefinedCall();

  beforeEach(() => {
    domQueryService = new DomQueryService();
    mutationObserver = new MutationObserver(() => {});
  });

  afterAll(() => {
    mockQuerySelectorAll.mockRestore();
  });

  describe("deepQueryElements", () => {
    it("queries form field elements that are nested within a ShadowDOM", () => {
      const root = document.createElement("div");
      const shadowRoot = root.attachShadow({ mode: "open" });
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.type = "text";
      form.appendChild(input);
      shadowRoot.appendChild(form);

      const formFieldElements = domQueryService.deepQueryElements(
        shadowRoot,
        "input",
        mutationObserver,
      );

      expect(formFieldElements).toStrictEqual([input]);
    });

    it("queries form field elements that are nested within multiple ShadowDOM elements", () => {
      const root = document.createElement("div");
      const shadowRoot1 = root.attachShadow({ mode: "open" });
      const root2 = document.createElement("div");
      const shadowRoot2 = root2.attachShadow({ mode: "open" });
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.type = "text";
      form.appendChild(input);
      shadowRoot2.appendChild(form);
      shadowRoot1.appendChild(root2);

      const formFieldElements = domQueryService.deepQueryElements(
        shadowRoot1,
        "input",
        mutationObserver,
      );

      expect(formFieldElements).toStrictEqual([input]);
    });
  });

  describe("queryAllTreeWalkerNodes", () => {
    it("queries form field elements that are nested within multiple ShadowDOM elements", () => {
      const root = document.createElement("div");
      const shadowRoot1 = root.attachShadow({ mode: "open" });
      const root2 = document.createElement("div");
      const shadowRoot2 = root2.attachShadow({ mode: "open" });
      const form = document.createElement("form");
      const input = document.createElement("input");
      input.type = "text";
      form.appendChild(input);
      shadowRoot2.appendChild(form);
      shadowRoot1.appendChild(root2);

      const formFieldElements = domQueryService.queryAllTreeWalkerNodes(
        shadowRoot1,
        (element: Element) => element.tagName === "INPUT",
        mutationObserver,
      );

      expect(formFieldElements).toStrictEqual([input]);
    });
  });
});
