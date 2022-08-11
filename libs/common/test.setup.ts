import { webcrypto } from "crypto";

import { toEqualBuffer } from "./spec/matchers/toEqualBuffer";

Object.defineProperty(window, "crypto", {
  value: webcrypto,
});

// Add custom matchers

expect.extend({
  toEqualBuffer: toEqualBuffer,
});

interface CustomMatchers<R = unknown> {
  toEqualBuffer(expected: Uint8Array | ArrayBuffer): R;
}

/* eslint-disable */
declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
/* eslint-enable */
