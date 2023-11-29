/**
 * Generates a random string of characters that formatted as a custom element name.
 */
function generateRandomCustomElementName(): string {
  const generateRandomChars = (length: number): string => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const randomChars = [];
    const randomBytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(randomBytes);

    for (let byteIndex = 0; byteIndex < randomBytes.length; byteIndex++) {
      const byte = randomBytes[byteIndex];
      randomChars.push(chars[byte % chars.length]);
    }

    return randomChars.join("");
  };

  const length = Math.floor(Math.random() * 5) + 8; // Between 8 and 12 characters
  const numHyphens = Math.min(Math.max(Math.floor(Math.random() * 4), 1), length - 1); // At least 1, maximum of 3 hyphens

  const hyphenIndices: number[] = [];
  while (hyphenIndices.length < numHyphens) {
    const index = Math.floor(Math.random() * (length - 1)) + 1;
    if (!hyphenIndices.includes(index)) {
      hyphenIndices.push(index);
    }
  }
  hyphenIndices.sort((a, b) => a - b);

  let randomString = "";
  let prevIndex = 0;

  for (let index = 0; index < hyphenIndices.length; index++) {
    const hyphenIndex = hyphenIndices[index];
    randomString = randomString + generateRandomChars(hyphenIndex - prevIndex) + "-";
    prevIndex = hyphenIndex;
  }

  randomString += generateRandomChars(length - prevIndex);

  return randomString;
}

/**
 * Builds a DOM element from an SVG string.
 *
 * @param svgString - The SVG string to build the DOM element from.
 * @param ariaHidden - Determines whether the SVG should be hidden from screen readers.
 */
function buildSvgDomElement(svgString: string, ariaHidden = true): HTMLElement {
  const domParser = new DOMParser();
  const svgDom = domParser.parseFromString(svgString, "image/svg+xml");
  const domElement = svgDom.documentElement;
  domElement.setAttribute("aria-hidden", `${ariaHidden}`);

  return domElement;
}

/**
 * Sends a message to the extension.
 *
 * @param command - The command to send.
 * @param options - The options to send with the command.
 */
async function sendExtensionMessage(
  command: string,
  options: Record<string, any> = {},
): Promise<any | void> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(Object.assign({ command }, options), (response) => {
      if (chrome.runtime.lastError) {
        return;
      }

      resolve(response);
    });
  });
}

/**
 * Sets CSS styles on an element.
 *
 * @param element - The element to set the styles on.
 * @param styles - The styles to set on the element.
 * @param priority - Determines whether the styles should be set as important.
 */
function setElementStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
  priority?: boolean,
) {
  if (!element || !styles || !Object.keys(styles).length) {
    return;
  }

  for (const styleProperty in styles) {
    element.style.setProperty(
      styleProperty.replace(/([a-z])([A-Z])/g, "$1-$2"), // Convert camelCase to kebab-case
      styles[styleProperty],
      priority ? "important" : undefined,
    );
  }
}

export {
  generateRandomCustomElementName,
  buildSvgDomElement,
  sendExtensionMessage,
  setElementStyles,
};
