import { EncryptedOrganizationKeyData } from "../../../admin-console/models/data/encrypted-organization-key.data";
import { BaseEncryptedOrganizationKey } from "../../../admin-console/models/domain/encrypted-organization-key";
import { OrganizationId, ProviderId } from "../../../types/guid";
import { OrgKey, ProviderKey, UserPrivateKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { CRYPTO_DISK, CRYPTO_MEMORY, DeriveDefinition, UserKeyDefinition } from "../../state";

export const USER_ENCRYPTED_ORGANIZATION_KEYS = UserKeyDefinition.record<
  EncryptedOrganizationKeyData,
  OrganizationId
>(CRYPTO_DISK, "organizationKeys", {
  deserializer: (obj) => obj,
  clearOn: ["logout"],
});

export const USER_ORGANIZATION_KEYS = new DeriveDefinition<
  [
    Record<OrganizationId, EncryptedOrganizationKeyData>,
    UserPrivateKey,
    Record<ProviderId, ProviderKey>,
  ],
  Record<OrganizationId, OrgKey>,
  { encryptService: EncryptService }
>(CRYPTO_MEMORY, "organizationKeys", {
  deserializer: (obj) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(obj ?? {}) as OrganizationId[]) {
      result[orgId] = SymmetricCryptoKey.fromJSON(obj[orgId]) as OrgKey;
    }
    return result;
  },
  derive: async ([encryptedOrgKeys, privateKey, providerKeys], { encryptService }) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(encryptedOrgKeys ?? {}) as OrganizationId[]) {
      if (result[orgId] != null) {
        continue;
      }
      const encrypted = BaseEncryptedOrganizationKey.fromData(encryptedOrgKeys[orgId]);

      let decrypted: OrgKey;

      if (BaseEncryptedOrganizationKey.isProviderEncrypted(encrypted)) {
        decrypted = await encrypted.decrypt(encryptService, providerKeys);
      } else {
        decrypted = await encrypted.decrypt(encryptService, privateKey);
      }

      result[orgId] = decrypted;
    }

    return result;
  },
});
