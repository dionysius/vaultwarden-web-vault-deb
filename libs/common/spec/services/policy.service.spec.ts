// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { PermissionsApi } from "@bitwarden/common/models/api/permissions.api";
import { OrganizationData } from "@bitwarden/common/models/data/organization.data";
import { PolicyData } from "@bitwarden/common/models/data/policy.data";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/master-password-policy-options";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { ResetPasswordPolicyOptions } from "@bitwarden/common/models/domain/reset-password-policy-options";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { PolicyResponse } from "@bitwarden/common/models/response/policy.response";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("PolicyService", () => {
  let policyService: PolicyService;

  let cryptoService: SubstituteOf<CryptoService>;
  let stateService: SubstituteOf<StateService>;
  let organizationService: SubstituteOf<OrganizationService>;
  let encryptService: SubstituteOf<EncryptService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    stateService = Substitute.for();
    organizationService = Substitute.for();
    organizationService
      .getAll("user")
      .resolves([
        new Organization(
          organizationData(
            "test-organization",
            true,
            true,
            OrganizationUserStatusType.Accepted,
            false
          )
        ),
      ]);
    organizationService.getAll(undefined).resolves([]);
    organizationService.getAll(null).resolves([]);
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);
    stateService.getDecryptedPolicies({ userId: "user" }).resolves(null);
    stateService.getEncryptedPolicies({ userId: "user" }).resolves({
      "1": policyData("1", "test-organization", PolicyType.MaximumVaultTimeout, true, {
        minutes: 14,
      }),
    });
    stateService.getEncryptedPolicies().resolves({
      "1": policyData("1", "test-organization", PolicyType.MaximumVaultTimeout, true, {
        minutes: 14,
      }),
    });
    stateService.activeAccount$.returns(activeAccount);
    stateService.activeAccountUnlocked$.returns(activeAccountUnlocked);
    stateService.getUserId().resolves("user");
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    policyService = new PolicyService(stateService, organizationService);
  });

  afterEach(() => {
    activeAccount.complete();
    activeAccountUnlocked.complete();
  });

  it("upsert", async () => {
    await policyService.upsert(policyData("99", "test-organization", PolicyType.DisableSend, true));

    expect(await firstValueFrom(policyService.policies$)).toEqual([
      {
        id: "1",
        organizationId: "test-organization",
        type: PolicyType.MaximumVaultTimeout,
        enabled: true,
        data: { minutes: 14 },
      },
      {
        id: "99",
        organizationId: "test-organization",
        type: PolicyType.DisableSend,
        enabled: true,
      },
    ]);
  });

  it("replace", async () => {
    await policyService.replace({
      "2": policyData("2", "test-organization", PolicyType.DisableSend, true),
    });

    expect(await firstValueFrom(policyService.policies$)).toEqual([
      {
        id: "2",
        organizationId: "test-organization",
        type: PolicyType.DisableSend,
        enabled: true,
      },
    ]);
  });

  it("locking should clear", async () => {
    activeAccountUnlocked.next(false);
    // Sleep for 100ms to avoid timing issues
    await new Promise((r) => setTimeout(r, 100));

    expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
  });

  describe("clear", () => {
    it("null userId", async () => {
      await policyService.clear();

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("matching userId", async () => {
      await policyService.clear("user");

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("mismatching userId", async () => {
      await policyService.clear("12");

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(1);
    });
  });

  describe("masterPasswordPolicyOptions", () => {
    it("returns default policy options", async () => {
      const data: any = {
        minComplexity: 5,
        minLength: 20,
        requireUpper: true,
      };
      const model = [
        new Policy(policyData("1", "test-organization-3", PolicyType.MasterPassword, true, data)),
      ];
      const result = await firstValueFrom(policyService.masterPasswordPolicyOptions$(model));

      expect(result).toEqual({
        minComplexity: 5,
        minLength: 20,
        requireLower: false,
        requireNumbers: false,
        requireSpecial: false,
        requireUpper: true,
      });
    });

    it("returns null", async () => {
      const data: any = {};
      const model = [
        new Policy(
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data)
        ),
        new Policy(
          policyData("4", "test-organization-3", PolicyType.MaximumVaultTimeout, true, data)
        ),
      ];

      const result = await firstValueFrom(policyService.masterPasswordPolicyOptions$(model));

      expect(result).toEqual(null);
    });

    it("returns specified policy options", async () => {
      const data: any = {
        minLength: 14,
      };
      const model = [
        new Policy(
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data)
        ),
        new Policy(policyData("4", "test-organization-3", PolicyType.MasterPassword, true, data)),
      ];

      const result = await firstValueFrom(policyService.masterPasswordPolicyOptions$(model));

      expect(result).toEqual({
        minComplexity: 0,
        minLength: 14,
        requireLower: false,
        requireNumbers: false,
        requireSpecial: false,
        requireUpper: false,
      });
    });
  });

  describe("evaluateMasterPassword", () => {
    it("false", async () => {
      const enforcedPolicyOptions = new MasterPasswordPolicyOptions();
      enforcedPolicyOptions.minLength = 14;
      const result = policyService.evaluateMasterPassword(10, "password", enforcedPolicyOptions);

      expect(result).toEqual(false);
    });

    it("true", async () => {
      const enforcedPolicyOptions = new MasterPasswordPolicyOptions();
      const result = policyService.evaluateMasterPassword(0, "password", enforcedPolicyOptions);

      expect(result).toEqual(true);
    });
  });

  describe("getResetPasswordPolicyOptions", () => {
    it("default", async () => {
      const result = policyService.getResetPasswordPolicyOptions(null, null);

      expect(result).toEqual([new ResetPasswordPolicyOptions(), false]);
    });

    it("returns autoEnrollEnabled true", async () => {
      const data: any = {
        autoEnrollEnabled: true,
      };
      const policies = [
        new Policy(policyData("5", "test-organization-3", PolicyType.ResetPassword, true, data)),
      ];
      const result = policyService.getResetPasswordPolicyOptions(policies, "test-organization-3");

      expect(result).toEqual([{ autoEnrollEnabled: true }, true]);
    });
  });

  describe("mapPoliciesFromToken", () => {
    it("null", async () => {
      const result = policyService.mapPoliciesFromToken(null);

      expect(result).toEqual(null);
    });

    it("null data", async () => {
      const model = new ListResponse(null, PolicyResponse);
      model.data = null;
      const result = policyService.mapPoliciesFromToken(model);

      expect(result).toEqual(null);
    });

    it("empty array", async () => {
      const model = new ListResponse(null, PolicyResponse);
      const result = policyService.mapPoliciesFromToken(model);

      expect(result).toEqual([]);
    });

    it("success", async () => {
      const policyResponse: any = {
        Data: [
          {
            Id: "1",
            OrganizationId: "organization-1",
            Type: PolicyType.DisablePersonalVaultExport,
            Enabled: true,
            Data: { requireUpper: true },
          },
          {
            Id: "2",
            OrganizationId: "organization-2",
            Type: PolicyType.DisableSend,
            Enabled: false,
            Data: { minComplexity: 5, minLength: 20 },
          },
        ],
      };
      const model = new ListResponse(policyResponse, PolicyResponse);
      const result = policyService.mapPoliciesFromToken(model);

      expect(result).toEqual([
        new Policy(
          policyData("1", "organization-1", PolicyType.DisablePersonalVaultExport, true, {
            requireUpper: true,
          })
        ),
        new Policy(
          policyData("2", "organization-2", PolicyType.DisableSend, false, {
            minComplexity: 5,
            minLength: 20,
          })
        ),
      ]);
    });
  });

  describe("policyAppliesToActiveUser$", () => {
    it("MasterPassword does not apply", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MasterPassword)
      );

      expect(result).toEqual(false);
    });

    it("MaximumVaultTimeout applies", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MaximumVaultTimeout)
      );

      expect(result).toEqual(true);
    });

    it("PolicyFilter filters result", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MaximumVaultTimeout, (p) => false)
      );

      expect(result).toEqual(false);
    });

    it("DisablePersonalVaultExport does not apply", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.DisablePersonalVaultExport)
      );

      expect(result).toEqual(false);
    });
  });

  describe("policyAppliesToUser", () => {
    it("MasterPassword does not apply", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MasterPassword,
        null,
        "user"
      );

      expect(result).toEqual(false);
    });

    it("MaximumVaultTimeout applies", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MaximumVaultTimeout,
        null,
        "user"
      );

      expect(result).toEqual(true);
    });

    it("PolicyFilter filters result", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MaximumVaultTimeout,
        (p) => false,
        "user"
      );

      expect(result).toEqual(false);
    });

    it("DisablePersonalVaultExport does not apply", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.DisablePersonalVaultExport,
        null,
        "user"
      );

      expect(result).toEqual(false);
    });
  });

  function policyData(
    id: string,
    organizationId: string,
    type: PolicyType,
    enabled: boolean,
    data?: any
  ) {
    const policyData = new PolicyData({} as any);
    policyData.id = id;
    policyData.organizationId = organizationId;
    policyData.type = type;
    policyData.enabled = enabled;
    policyData.data = data;

    return policyData;
  }

  function organizationData(
    id: string,
    enabled: boolean,
    usePolicies: boolean,
    status: OrganizationUserStatusType,
    managePolicies: boolean
  ) {
    const organizationData = new OrganizationData({} as any);
    organizationData.id = id;
    organizationData.enabled = enabled;
    organizationData.usePolicies = usePolicies;
    organizationData.status = status;
    organizationData.permissions = new PermissionsApi({ managePolicies: managePolicies } as any);
    return organizationData;
  }
});
