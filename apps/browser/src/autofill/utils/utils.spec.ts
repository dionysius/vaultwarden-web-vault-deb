import { logoIcon, logoLockedIcon } from "./svg-icons";
import {
  buildSvgDomElement,
  generateRandomCustomElementName,
  sendExtensionMessage,
  setElementStyles,
} from "./utils";

describe("buildSvgDomElement", () => {
  it("returns an SVG DOM element", () => {
    const builtSVG = buildSvgDomElement(logoIcon);
    const builtSVGAriaVisible = buildSvgDomElement(logoLockedIcon, false);

    expect(builtSVG.tagName).toEqual("svg");
    expect(builtSVG.getAttribute("aria-hidden")).toEqual("true");
    expect(builtSVGAriaVisible.tagName).toEqual("svg");
    expect(builtSVGAriaVisible.getAttribute("aria-hidden")).toEqual("false");
  });
});

describe("generateRandomCustomElementName", () => {
  it("returns a randomized value", async () => {
    let generatedValue = "";

    expect(generatedValue).toHaveLength(0);

    generatedValue = generateRandomCustomElementName();

    expect(generatedValue.length).toBeGreaterThan(0);
  });
});

describe("sendExtensionMessage", () => {
  it("sends a message to the extention", () => {
    const extensionMessageResponse = sendExtensionMessage("updateAutofillOverlayHidden", {
      display: "none",
    });
    jest.spyOn(chrome.runtime, "sendMessage");

    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    expect(extensionMessageResponse).toEqual(Promise.resolve({}));
  });
});

describe("setElementStyles", () => {
  const passedRules = { backgroundColor: "hotpink", color: "cyan" };
  const expectedCSSRuleString = "background-color: hotpink; color: cyan;";
  const expectedImportantCSSRuleString =
    "background-color: hotpink !important; color: cyan !important;";

  it("sets the passed styles to the passed HTMLElement", async () => {
    const domParser = new DOMParser();
    const testDivDOM = domParser.parseFromString(
      "<div>This is an unexciting div.</div>",
      "text/html",
    );
    const testDiv = testDivDOM.querySelector("div");

    expect(testDiv.getAttribute("style")).toEqual(null);

    setElementStyles(testDiv, passedRules);

    expect(testDiv.getAttribute("style")).toEqual(expectedCSSRuleString);
  });

  it("sets the passed styles with !important flag to the passed HTMLElement", () => {
    const domParser = new DOMParser();
    const testDivDOM = domParser.parseFromString(
      "<div>This is an unexciting div.</div>",
      "text/html",
    );
    const testDiv = testDivDOM.querySelector("div");

    expect(testDiv.style.cssText).toEqual("");

    setElementStyles(testDiv, passedRules, true);

    expect(testDiv.style.cssText).toEqual(expectedImportantCSSRuleString);
  });

  it("makes no changes when no element is passed", () => {
    const domParser = new DOMParser();
    const testDivDOM = domParser.parseFromString(
      "<div>This is an unexciting div.</div>",
      "text/html",
    );
    const testDiv = testDivDOM.querySelector("div");

    expect(testDiv.style.cssText).toEqual("");

    setElementStyles(testDiv, passedRules);

    expect(testDiv.style.cssText).toEqual(expectedCSSRuleString);

    setElementStyles(undefined, passedRules, true);

    expect(testDiv.style.cssText).toEqual(expectedCSSRuleString);
  });

  it("makes no changes when no CSS rules are passed", () => {
    const domParser = new DOMParser();
    const testDivDOM = domParser.parseFromString(
      "<div>This is an unexciting div.</div>",
      "text/html",
    );
    const testDiv = testDivDOM.querySelector("div");

    expect(testDiv.style.cssText).toEqual("");

    setElementStyles(testDiv, passedRules);

    expect(testDiv.style.cssText).toEqual(expectedCSSRuleString);

    setElementStyles(testDiv, {}, true);

    expect(testDiv.style.cssText).toEqual(expectedCSSRuleString);
  });
});
