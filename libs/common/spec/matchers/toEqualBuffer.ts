/**
 * The inbuilt toEqual() matcher will always return TRUE when provided with 2 ArrayBuffers.
 * This is because an ArrayBuffer must be wrapped in a new Uint8Array to be accessible.
 * This custom matcher will automatically instantiate a new Uint8Array on the recieved value
 * (and optionally, the expected value) and then call toEqual() on the resulting Uint8Arrays.
 */
export const toEqualBuffer: jest.CustomMatcher = function (
  received: ArrayBuffer,
  expected: Uint8Array | ArrayBuffer
) {
  received = new Uint8Array(received);

  if (expected instanceof ArrayBuffer) {
    expected = new Uint8Array(expected);
  }

  if (this.equals(received, expected)) {
    return {
      message: () => `expected
${received}
not to match
${expected}`,
      pass: true,
    };
  }

  return {
    message: () => `expected
${received}
to match
${expected}`,
    pass: false,
  };
};
