import { mock } from "jest-mock-extended";

import { makeEncString, makeStaticByteArray } from "../../../../spec";
import { OrgKey, UserPrivateKey } from "../../../types/key";
import { EncryptService } from "../../abstractions/encrypt.service";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";

import { USER_ENCRYPTED_ORGANIZATION_KEYS, USER_ORGANIZATION_KEYS } from "./org-keys.state";

describe("encrypted org keys", () => {
  const sut = USER_ENCRYPTED_ORGANIZATION_KEYS;

  it("should deserialize encrypted org keys", () => {
    const encryptedOrgKeys = {
      "org-id-1": {
        type: "organization",
        key: makeEncString().encryptedString,
      },
      "org-id-2": {
        type: "provider",
        key: makeEncString().encryptedString,
        providerId: "provider-id-2",
      },
    };

    const result = sut.deserializer(JSON.parse(JSON.stringify(encryptedOrgKeys)));

    expect(result).toEqual(encryptedOrgKeys);
  });
});

describe("derived decrypted org keys", () => {
  const encryptService = mock<EncryptService>();
  const userPrivateKey = makeStaticByteArray(64, 3) as UserPrivateKey;
  const sut = USER_ORGANIZATION_KEYS;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should deserialize org keys", async () => {
    const decryptedOrgKeys = {
      "org-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as OrgKey,
      "org-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)) as OrgKey,
    };

    const result = sut.deserialize(JSON.parse(JSON.stringify(decryptedOrgKeys)));

    expect(result).toEqual(decryptedOrgKeys);
  });

  it("should derive org keys", async () => {
    const encryptedOrgKeys = {
      "org-id-1": {
        type: "organization",
        key: makeEncString().encryptedString,
      },
      "org-id-2": {
        type: "organization",
        key: makeEncString().encryptedString,
      },
    };

    const decryptedOrgKeys = {
      "org-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as OrgKey,
      "org-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)) as OrgKey,
    };

    // TODO: How to not have to mock these decryptions. They are internal concerns of EncryptedOrganizationKey
    encryptService.rsaDecrypt.mockResolvedValueOnce(decryptedOrgKeys["org-id-1"].key);
    encryptService.rsaDecrypt.mockResolvedValueOnce(decryptedOrgKeys["org-id-2"].key);

    const result = await sut.derive([encryptedOrgKeys, userPrivateKey, {}], { encryptService });

    expect(result).toEqual(decryptedOrgKeys);
  });

  it("should derive org keys from providers", async () => {
    const encryptedOrgKeys = {
      "org-id-1": {
        type: "provider",
        key: makeEncString().encryptedString,
        providerId: "provider-id-1",
      },
      "org-id-2": {
        type: "provider",
        key: makeEncString().encryptedString,
        providerId: "provider-id-2",
      },
    };

    const providerKeys = {
      "provider-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)),
      "provider-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)),
    };

    const decryptedOrgKeys = {
      "org-id-1": new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as OrgKey,
      "org-id-2": new SymmetricCryptoKey(makeStaticByteArray(64, 2)) as OrgKey,
    };

    // TODO: How to not have to mock these decryptions. They are internal concerns of ProviderEncryptedOrganizationKey
    encryptService.decryptToBytes.mockResolvedValueOnce(decryptedOrgKeys["org-id-1"].key);
    encryptService.decryptToBytes.mockResolvedValueOnce(decryptedOrgKeys["org-id-2"].key);

    const result = await sut.derive([encryptedOrgKeys, userPrivateKey, providerKeys], {
      encryptService,
    });

    expect(result).toEqual(decryptedOrgKeys);
  });
});
