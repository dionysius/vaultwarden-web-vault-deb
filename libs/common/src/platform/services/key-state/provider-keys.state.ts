import { ProviderId } from "../../../types/guid";
import { ProviderKey, UserPrivateKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { EncString, EncryptedString } from "../../models/domain/enc-string";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { CRYPTO_DISK, CRYPTO_MEMORY, DeriveDefinition, UserKeyDefinition } from "../../state";

export const USER_ENCRYPTED_PROVIDER_KEYS = UserKeyDefinition.record<EncryptedString, ProviderId>(
  CRYPTO_DISK,
  "providerKeys",
  {
    deserializer: (obj) => obj,
    clearOn: ["logout"],
  },
);

export const USER_PROVIDER_KEYS = new DeriveDefinition<
  [Record<ProviderId, EncryptedString>, UserPrivateKey],
  Record<ProviderId, ProviderKey>,
  { encryptService: EncryptService }
>(CRYPTO_MEMORY, "providerKeys", {
  deserializer: (obj) => {
    const result: Record<ProviderId, ProviderKey> = {};
    for (const providerId of Object.keys(obj ?? {}) as ProviderId[]) {
      result[providerId] = SymmetricCryptoKey.fromJSON(obj[providerId]) as ProviderKey;
    }
    return result;
  },
  derive: async ([encryptedProviderKeys, privateKey], { encryptService }) => {
    const result: Record<ProviderId, ProviderKey> = {};
    for (const providerId of Object.keys(encryptedProviderKeys ?? {}) as ProviderId[]) {
      if (result[providerId] != null) {
        continue;
      }
      const encrypted = new EncString(encryptedProviderKeys[providerId]);
      const decrypted = await encryptService.rsaDecrypt(encrypted, privateKey);
      const providerKey = new SymmetricCryptoKey(decrypted) as ProviderKey;

      result[providerId] = providerKey;
    }

    return result;
  },
});
