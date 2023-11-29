import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";

import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { RotateableKeySetService } from "./rotateable-key-set.service";

describe("RotateableKeySetService", () => {
  let testBed!: TestBed;
  let cryptoService!: MockProxy<CryptoService>;
  let encryptService!: MockProxy<EncryptService>;
  let service!: RotateableKeySetService;

  beforeEach(() => {
    cryptoService = mock<CryptoService>();
    encryptService = mock<EncryptService>();
    testBed = TestBed.configureTestingModule({
      providers: [
        { provide: CryptoService, useValue: cryptoService },
        { provide: EncryptService, useValue: encryptService },
      ],
    });
    service = testBed.inject(RotateableKeySetService);
  });

  describe("createKeySet", () => {
    it("should create a new key set", async () => {
      const externalKey = createSymmetricKey();
      const userKey = createSymmetricKey();
      const encryptedUserKey = Symbol();
      const encryptedPublicKey = Symbol();
      const encryptedPrivateKey = Symbol();
      cryptoService.makeKeyPair.mockResolvedValue(["publicKey", encryptedPrivateKey as any]);
      cryptoService.getUserKey.mockResolvedValue({ key: userKey.key } as any);
      cryptoService.rsaEncrypt.mockResolvedValue(encryptedUserKey as any);
      encryptService.encrypt.mockResolvedValue(encryptedPublicKey as any);

      const result = await service.createKeySet(externalKey as any);

      expect(result).toEqual({
        encryptedUserKey,
        encryptedPublicKey,
        encryptedPrivateKey,
      });
    });
  });
});

function createSymmetricKey() {
  const key = Utils.fromB64ToArray(
    "1h-TuPwSbX5qoX0aVgjmda_Lfq85qAcKssBlXZnPIsQC3HNDGIecunYqXhJnp55QpdXRh-egJiLH3a0wqlVQsQ",
  );
  return new SymmetricCryptoKey(key);
}
