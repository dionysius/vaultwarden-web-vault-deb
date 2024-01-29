import { ProviderId } from "../../../types/guid";
import { ProviderKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { EncString, EncryptedString } from "../../models/domain/enc-string";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { KeyDefinition, CRYPTO_DISK, DeriveDefinition } from "../../state";
import { CryptoService } from "../crypto.service";

export const USER_ENCRYPTED_PROVIDER_KEYS = KeyDefinition.record<EncryptedString, ProviderId>(
  CRYPTO_DISK,
  "providerKeys",
  {
    deserializer: (obj) => obj,
  },
);

export const USER_PROVIDER_KEYS = DeriveDefinition.from<
  Record<ProviderId, EncryptedString>,
  Record<ProviderId, ProviderKey>,
  { encryptService: EncryptService; cryptoService: CryptoService } // TODO: This should depend on an active user private key observable directly
>(USER_ENCRYPTED_PROVIDER_KEYS, {
  deserializer: (obj) => {
    const result: Record<ProviderId, ProviderKey> = {};
    for (const providerId of Object.keys(obj ?? {}) as ProviderId[]) {
      result[providerId] = SymmetricCryptoKey.fromJSON(obj[providerId]) as ProviderKey;
    }
    return result;
  },
  derive: async (from, { encryptService, cryptoService }) => {
    const result: Record<ProviderId, ProviderKey> = {};
    for (const providerId of Object.keys(from ?? {}) as ProviderId[]) {
      if (result[providerId] != null) {
        continue;
      }
      const encrypted = new EncString(from[providerId]);
      const privateKey = await cryptoService.getPrivateKey();
      const decrypted = await encryptService.rsaDecrypt(encrypted, privateKey);
      const providerKey = new SymmetricCryptoKey(decrypted) as ProviderKey;

      result[providerId] = providerKey;
    }

    return result;
  },
});
