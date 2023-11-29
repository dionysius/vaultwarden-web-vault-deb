/*
   Copyright 2015 D2L Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License. */

// Changes:
// - Cherry-pick the methods that we have a need for.
// - Add typings.
// - Original code is made for running in node, this version is adapted to work in the browser.

// https://github.com/Brightspace/node-ecdsa-sig-formatter/blob/master/src/param-bytes-for-alg.js

function getParamSize(keySize: number) {
  const result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
  return result;
}

const paramBytesForAlg = {
  ES256: getParamSize(256),
  ES384: getParamSize(384),
  ES512: getParamSize(521),
};

type Alg = keyof typeof paramBytesForAlg;

function getParamBytesForAlg(alg: Alg) {
  const paramBytes = paramBytesForAlg[alg];
  if (paramBytes) {
    return paramBytes;
  }

  throw new Error('Unknown algorithm "' + alg + '"');
}

// https://github.com/Brightspace/node-ecdsa-sig-formatter/blob/master/src/ecdsa-sig-formatter.js

const MAX_OCTET = 0x80,
  CLASS_UNIVERSAL = 0,
  PRIMITIVE_BIT = 0x20,
  TAG_SEQ = 0x10,
  TAG_INT = 0x02,
  ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | (CLASS_UNIVERSAL << 6),
  ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

function countPadding(buf: Uint8Array, start: number, stop: number) {
  let padding = 0;
  while (start + padding < stop && buf[start + padding] === 0) {
    ++padding;
  }

  const needsSign = buf[start + padding] >= MAX_OCTET;
  if (needsSign) {
    --padding;
  }

  return padding;
}

export function joseToDer(signature: Uint8Array, alg: Alg) {
  const paramBytes = getParamBytesForAlg(alg);

  const signatureBytes = signature.length;
  if (signatureBytes !== paramBytes * 2) {
    throw new TypeError(
      '"' +
        alg +
        '" signatures must be "' +
        paramBytes * 2 +
        '" bytes, saw "' +
        signatureBytes +
        '"',
    );
  }

  const rPadding = countPadding(signature, 0, paramBytes);
  const sPadding = countPadding(signature, paramBytes, signature.length);
  const rLength = paramBytes - rPadding;
  const sLength = paramBytes - sPadding;

  const rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

  const shortLength = rsBytes < MAX_OCTET;

  const dst = new Uint8Array((shortLength ? 2 : 3) + rsBytes);

  let offset = 0;
  dst[offset++] = ENCODED_TAG_SEQ;
  if (shortLength) {
    dst[offset++] = rsBytes;
  } else {
    dst[offset++] = MAX_OCTET | 1;
    dst[offset++] = rsBytes & 0xff;
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = rLength;
  if (rPadding < 0) {
    dst[offset++] = 0;
    dst.set(signature.subarray(0, paramBytes), offset);
    offset += paramBytes;
  } else {
    dst.set(signature.subarray(rPadding, paramBytes), offset);
    offset += paramBytes;
  }
  dst[offset++] = ENCODED_TAG_INT;
  dst[offset++] = sLength;
  if (sPadding < 0) {
    dst[offset++] = 0;
    dst.set(signature.subarray(paramBytes), offset);
  } else {
    dst.set(signature.subarray(paramBytes + sPadding), offset);
  }

  return dst;
}
