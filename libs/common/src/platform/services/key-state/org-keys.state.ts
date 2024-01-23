import { EncryptedOrganizationKeyData } from "../../../admin-console/models/data/encrypted-organization-key.data";
import { BaseEncryptedOrganizationKey } from "../../../admin-console/models/domain/encrypted-organization-key";
import { OrganizationId } from "../../../types/guid";
import { OrgKey } from "../../../types/key";
import { CryptoService } from "../../abstractions/crypto.service";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { KeyDefinition, CRYPTO_DISK, DeriveDefinition } from "../../state";

export const USER_ENCRYPTED_ORGANIZATION_KEYS = KeyDefinition.record<
  EncryptedOrganizationKeyData,
  OrganizationId
>(CRYPTO_DISK, "organizationKeys", {
  deserializer: (obj) => obj,
});

export const USER_ORGANIZATION_KEYS = DeriveDefinition.from<
  Record<OrganizationId, EncryptedOrganizationKeyData>,
  Record<OrganizationId, OrgKey>,
  { cryptoService: CryptoService }
>(USER_ENCRYPTED_ORGANIZATION_KEYS, {
  deserializer: (obj) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(obj ?? {}) as OrganizationId[]) {
      result[orgId] = SymmetricCryptoKey.fromJSON(obj[orgId]) as OrgKey;
    }
    return result;
  },
  derive: async (from, { cryptoService }) => {
    const result: Record<OrganizationId, OrgKey> = {};
    for (const orgId of Object.keys(from ?? {}) as OrganizationId[]) {
      if (result[orgId] != null) {
        continue;
      }
      const encrypted = BaseEncryptedOrganizationKey.fromData(from[orgId]);
      const decrypted = await encrypted.decrypt(cryptoService);

      result[orgId] = decrypted;
    }

    return result;
  },
});
