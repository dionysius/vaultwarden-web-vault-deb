import { mock, MockProxy } from "jest-mock-extended";

import { CryptoFunctionService } from "../../../platform/abstractions/crypto-function.service";

import { WebAuthnLoginPrfCryptoService } from "./webauthn-login-prf-crypto.service";

describe("WebAuthnLoginPrfCryptoService", () => {
  let cryptoFunctionService: MockProxy<CryptoFunctionService>;
  let service: WebAuthnLoginPrfCryptoService;

  beforeEach(() => {
    cryptoFunctionService = mock<CryptoFunctionService>();
    service = new WebAuthnLoginPrfCryptoService(cryptoFunctionService);
  });

  describe("createSymmetricKeyFromPrf", () => {
    it("should stretch the key to 64 bytes when given a key with 32 bytes", async () => {
      cryptoFunctionService.hkdfExpand.mockImplementation((key, salt, length) =>
        Promise.resolve(randomBytes(length)),
      );

      const result = await service.createSymmetricKeyFromPrf(randomBytes(32));

      expect(result.key.length).toBe(64);
    });
  });
});

/** This is a fake function that always returns the same byte sequence */
function randomBytes(length: number) {
  return new Uint8Array(Array.from({ length }, (_, k) => k % 255));
}
