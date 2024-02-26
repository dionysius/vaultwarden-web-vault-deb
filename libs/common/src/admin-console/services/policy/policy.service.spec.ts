import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { FakeStateProvider, mockAccountServiceWith } from "../../../../spec";
import { FakeActiveUserState } from "../../../../spec/fake-state";
import { OrganizationService } from "../../../admin-console/abstractions/organization/organization.service.abstraction";
import {
  OrganizationUserStatusType,
  OrganizationUserType,
  PolicyType,
} from "../../../admin-console/enums";
import { PermissionsApi } from "../../../admin-console/models/api/permissions.api";
import { OrganizationData } from "../../../admin-console/models/data/organization.data";
import { PolicyData } from "../../../admin-console/models/data/policy.data";
import { MasterPasswordPolicyOptions } from "../../../admin-console/models/domain/master-password-policy-options";
import { Organization } from "../../../admin-console/models/domain/organization";
import { Policy } from "../../../admin-console/models/domain/policy";
import { ResetPasswordPolicyOptions } from "../../../admin-console/models/domain/reset-password-policy-options";
import { PolicyResponse } from "../../../admin-console/models/response/policy.response";
import { POLICIES, PolicyService } from "../../../admin-console/services/policy/policy.service";
import { ListResponse } from "../../../models/response/list.response";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { ContainerService } from "../../../platform/services/container.service";
import { StateService } from "../../../platform/services/state.service";
import { PolicyId, UserId } from "../../../types/guid";

describe("PolicyService", () => {
  let policyService: PolicyService;

  let cryptoService: MockProxy<CryptoService>;
  let stateService: MockProxy<StateService>;
  let stateProvider: FakeStateProvider;
  let organizationService: MockProxy<OrganizationService>;
  let encryptService: MockProxy<EncryptService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    stateService = mock<StateService>();

    const accountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(accountService);
    organizationService = mock<OrganizationService>();
    organizationService.getAll
      .calledWith("user")
      .mockResolvedValue([
        new Organization(
          organizationData(
            "test-organization",
            true,
            true,
            OrganizationUserStatusType.Accepted,
            false,
          ),
        ),
      ]);
    organizationService.getAll.calledWith(undefined).mockResolvedValue([]);
    organizationService.getAll.calledWith(null).mockResolvedValue([]);
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);
    stateService.getDecryptedPolicies.calledWith({ userId: "user" }).mockResolvedValue(null);
    stateService.getEncryptedPolicies.calledWith({ userId: "user" }).mockResolvedValue({
      "1": policyData("1", "test-organization", PolicyType.MaximumVaultTimeout, true, {
        minutes: 14,
      }),
    });
    stateService.getEncryptedPolicies.mockResolvedValue({
      "1": policyData("1", "test-organization", PolicyType.MaximumVaultTimeout, true, {
        minutes: 14,
      }),
    });
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;
    stateService.getUserId.mockResolvedValue("user");
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    policyService = new PolicyService(stateService, stateProvider, organizationService);
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

      expect(stateService.setEncryptedPolicies).toBeCalledTimes(1);

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("matching userId", async () => {
      await policyService.clear("user");

      expect(stateService.setEncryptedPolicies).toBeCalledTimes(1);

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("mismatching userId", async () => {
      await policyService.clear("12");

      expect(stateService.setEncryptedPolicies).toBeCalledTimes(1);

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
        enforceOnLogin: false,
      });
    });

    it("returns null", async () => {
      const data: any = {};
      const model = [
        new Policy(
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data),
        ),
        new Policy(
          policyData("4", "test-organization-3", PolicyType.MaximumVaultTimeout, true, data),
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
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data),
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
        enforceOnLogin: false,
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
          }),
        ),
        new Policy(
          policyData("2", "organization-2", PolicyType.DisableSend, false, {
            minComplexity: 5,
            minLength: 20,
          }),
        ),
      ]);
    });
  });

  describe("policyAppliesToActiveUser$", () => {
    it("MasterPassword does not apply", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MasterPassword),
      );

      expect(result).toEqual(false);
    });

    it("MaximumVaultTimeout applies", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MaximumVaultTimeout),
      );

      expect(result).toEqual(true);
    });

    it("PolicyFilter filters result", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.MaximumVaultTimeout, (p) => false),
      );

      expect(result).toEqual(false);
    });

    it("DisablePersonalVaultExport does not apply", async () => {
      const result = await firstValueFrom(
        policyService.policyAppliesToActiveUser$(PolicyType.DisablePersonalVaultExport),
      );

      expect(result).toEqual(false);
    });
  });

  describe("policyAppliesToUser", () => {
    it("MasterPassword does not apply", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MasterPassword,
        null,
        "user",
      );

      expect(result).toEqual(false);
    });

    it("MaximumVaultTimeout applies", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MaximumVaultTimeout,
        null,
        "user",
      );

      expect(result).toEqual(true);
    });

    it("PolicyFilter filters result", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.MaximumVaultTimeout,
        (p) => false,
        "user",
      );

      expect(result).toEqual(false);
    });

    it("DisablePersonalVaultExport does not apply", async () => {
      const result = await policyService.policyAppliesToUser(
        PolicyType.DisablePersonalVaultExport,
        null,
        "user",
      );

      expect(result).toEqual(false);
    });
  });

  // TODO: remove this nesting once fully migrated to StateProvider
  describe("stateProvider methods", () => {
    let policyState$: FakeActiveUserState<Record<PolicyId, PolicyData>>;

    beforeEach(() => {
      policyState$ = stateProvider.activeUser.getFake(POLICIES);
      organizationService.organizations$ = new BehaviorSubject([
        // User
        organization("org1", true, true, OrganizationUserStatusType.Confirmed, false),
        // Owner
        organization(
          "org2",
          true,
          true,
          OrganizationUserStatusType.Confirmed,
          false,
          OrganizationUserType.Owner,
        ),
        // Does not use policies
        organization("org3", true, false, OrganizationUserStatusType.Confirmed, false),
        // Another User
        organization("org4", true, true, OrganizationUserStatusType.Confirmed, false),
        // Another User
        organization("org5", true, true, OrganizationUserStatusType.Confirmed, false),
      ]);
    });

    describe("get_vNext$", () => {
      it("returns the specified PolicyType", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy2", "org1", PolicyType.DisablePersonalVaultExport, true),
          ]),
        );

        const result = await firstValueFrom(
          policyService.get_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toEqual({
          id: "policy2",
          organizationId: "org1",
          type: PolicyType.DisablePersonalVaultExport,
          enabled: true,
        });
      });

      it("does not return disabled policies", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy2", "org1", PolicyType.DisablePersonalVaultExport, false),
          ]),
        );

        const result = await firstValueFrom(
          policyService.get_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toBeNull();
      });

      it("does not return policies that do not apply to the user because the user's role is exempt", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy2", "org2", PolicyType.DisablePersonalVaultExport, false),
          ]),
        );

        const result = await firstValueFrom(
          policyService.get_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toBeNull();
      });

      it("does not return policies for organizations that do not use policies", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org3", PolicyType.ActivateAutofill, true),
            policyData("policy2", "org2", PolicyType.DisablePersonalVaultExport, true),
          ]),
        );

        const result = await firstValueFrom(policyService.get_vNext$(PolicyType.ActivateAutofill));

        expect(result).toBeNull();
      });
    });

    describe("getAll_vNext$", () => {
      it("returns the specified PolicyTypes", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org4", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy2", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy3", "org5", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy4", "org1", PolicyType.DisablePersonalVaultExport, true),
          ]),
        );

        const result = await firstValueFrom(
          policyService.getAll_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toEqual([
          {
            id: "policy1",
            organizationId: "org4",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
          {
            id: "policy3",
            organizationId: "org5",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
          {
            id: "policy4",
            organizationId: "org1",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
        ]);
      });

      it("does not return disabled policies", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org4", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy2", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy3", "org5", PolicyType.DisablePersonalVaultExport, false), // disabled
            policyData("policy4", "org1", PolicyType.DisablePersonalVaultExport, true),
          ]),
        );

        const result = await firstValueFrom(
          policyService.getAll_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toEqual([
          {
            id: "policy1",
            organizationId: "org4",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
          {
            id: "policy4",
            organizationId: "org1",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
        ]);
      });

      it("does not return policies that do not apply to the user because the user's role is exempt", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org4", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy2", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy3", "org5", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy4", "org2", PolicyType.DisablePersonalVaultExport, true), // owner
          ]),
        );

        const result = await firstValueFrom(
          policyService.getAll_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toEqual([
          {
            id: "policy1",
            organizationId: "org4",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
          {
            id: "policy3",
            organizationId: "org5",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
        ]);
      });

      it("does not return policies for organizations that do not use policies", async () => {
        policyState$.nextState(
          arrayToRecord([
            policyData("policy1", "org4", PolicyType.DisablePersonalVaultExport, true),
            policyData("policy2", "org1", PolicyType.ActivateAutofill, true),
            policyData("policy3", "org3", PolicyType.DisablePersonalVaultExport, true), // does not use policies
            policyData("policy4", "org1", PolicyType.DisablePersonalVaultExport, true),
          ]),
        );

        const result = await firstValueFrom(
          policyService.getAll_vNext$(PolicyType.DisablePersonalVaultExport),
        );

        expect(result).toEqual([
          {
            id: "policy1",
            organizationId: "org4",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
          {
            id: "policy4",
            organizationId: "org1",
            type: PolicyType.DisablePersonalVaultExport,
            enabled: true,
          },
        ]);
      });
    });
  });

  function policyData(
    id: string,
    organizationId: string,
    type: PolicyType,
    enabled: boolean,
    data?: any,
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
    managePolicies: boolean,
    type: OrganizationUserType = OrganizationUserType.User,
  ) {
    const organizationData = new OrganizationData({} as any, {} as any);
    organizationData.id = id;
    organizationData.enabled = enabled;
    organizationData.usePolicies = usePolicies;
    organizationData.status = status;
    organizationData.permissions = new PermissionsApi({ managePolicies: managePolicies } as any);
    organizationData.type = type;
    return organizationData;
  }

  function organization(
    id: string,
    enabled: boolean,
    usePolicies: boolean,
    status: OrganizationUserStatusType,
    managePolicies: boolean,
    type: OrganizationUserType = OrganizationUserType.User,
  ) {
    return new Organization(
      organizationData(id, enabled, usePolicies, status, managePolicies, type),
    );
  }

  function arrayToRecord(input: PolicyData[]): Record<PolicyId, PolicyData> {
    return Object.fromEntries(input.map((i) => [i.id, i]));
  }
});
