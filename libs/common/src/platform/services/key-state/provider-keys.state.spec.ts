import { mock } from "jest-mock-extended";

import { makeStaticByteArray } from "../../../../spec";
import { ProviderId } from "../../../types/guid";
import { ProviderKey, UserPrivateKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { EncryptionType } from "../../enums";
import { Utils } from "../../misc/utils";
import { EncString, EncryptedString } from "../../models/domain/enc-string";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { CryptoService } from "../crypto.service";

import { USER_ENCRYPTED_PROVIDER_KEYS, USER_PROVIDER_KEYS } from "./provider-keys.state";

function makeEncString(data?: string) {
  data ??= Utils.newGuid();
  return new EncString(EncryptionType.AesCbc256_HmacSha256_B64, data, "test", "test");
}

describe("encrypted provider keys", () => {
  const sut = USER_ENCRYPTED_PROVIDER_KEYS;

  it("should deserialize encrypted provider keys", () => {
    const encryptedProviderKeys = {
      "provider-id-1": makeEncString().encryptedString,
      "provider-id-2": makeEncString().encryptedString,
    };

    const result = sut.deserializer(JSON.parse(JSON.stringify(encryptedProviderKeys)));

    expect(result).toEqual(encryptedProviderKeys);
  });
});

describe("derived decrypted provider keys", () => {
  const encryptService = mock<EncryptService>();
  const cryptoService = mock<CryptoService>();
  const userPrivateKey = makeStaticByteArray(64, 0) as UserPrivateKey;
  const sut = USER_PROVIDER_KEYS;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should deserialize provider keys", async () => {
    const decryptedProviderKeys = {
      "provider-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as ProviderKey,
      "provider-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)) as ProviderKey,
    };

    const result = sut.deserialize(JSON.parse(JSON.stringify(decryptedProviderKeys)));

    expect(result).toEqual(decryptedProviderKeys);
  });

  it("should derive provider keys", async () => {
    const encryptedProviderKeys = {
      "provider-id-1": makeEncString().encryptedString,
      "provider-id-2": makeEncString().encryptedString,
    };

    const decryptedProviderKeys = {
      "provider-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as ProviderKey,
      "provider-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)) as ProviderKey,
    };

    encryptService.rsaDecrypt.mockResolvedValueOnce(decryptedProviderKeys["provider-id-1"].key);
    encryptService.rsaDecrypt.mockResolvedValueOnce(decryptedProviderKeys["provider-id-2"].key);
    cryptoService.getPrivateKey.mockResolvedValueOnce(userPrivateKey);

    const result = await sut.derive(encryptedProviderKeys, { encryptService, cryptoService });

    expect(result).toEqual(decryptedProviderKeys);
  });

  it("should handle null input values", async () => {
    const encryptedProviderKeys: Record<ProviderId, EncryptedString> = null;

    const result = await sut.derive(encryptedProviderKeys, { encryptService, cryptoService });

    expect(result).toEqual({});
  });
});
