import { MockProxy, mock, any, mockClear } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";
import { OrganizationData } from "@bitwarden/common/models/data/organization.data";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";

describe("Organization Service", () => {
  let organizationService: OrganizationService;

  let stateService: MockProxy<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  const resetStateService = async (
    customizeStateService: (stateService: MockProxy<StateService>) => void
  ) => {
    mockClear(stateService);
    stateService = mock<StateService>();
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;
    customizeStateService(stateService);
    organizationService = new OrganizationService(stateService);
    await new Promise((r) => setTimeout(r, 50));
  };

  beforeEach(() => {
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService = mock<StateService>();
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;

    stateService.getOrganizations.calledWith(any()).mockResolvedValue({
      "1": organizationData("1", "Test Org"),
    });

    organizationService = new OrganizationService(stateService);
  });

  afterEach(() => {
    activeAccount.complete();
    activeAccountUnlocked.complete();
  });

  it("getAll", async () => {
    const orgs = await organizationService.getAll();
    expect(orgs).toHaveLength(1);
    const org = orgs[0];
    expect(org).toEqual({
      id: "1",
      name: "Test Org",
      identifier: "test",
    });
  });

  describe("canManageSponsorships", () => {
    it("can because one is available", async () => {
      await resetStateService((stateService) => {
        stateService.getOrganizations.mockResolvedValue({
          "1": { ...organizationData("1", "Org"), familySponsorshipAvailable: true },
        });
      });

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(true);
    });

    it("can because one is used", async () => {
      await resetStateService((stateService) => {
        stateService.getOrganizations.mockResolvedValue({
          "1": { ...organizationData("1", "Test Org"), familySponsorshipFriendlyName: "Something" },
        });
      });

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(true);
    });

    it("can not because one isn't available or taken", async () => {
      await resetStateService((stateService) => {
        stateService.getOrganizations.mockResolvedValue({
          "1": { ...organizationData("1", "Org"), familySponsorshipFriendlyName: null },
        });
      });

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(false);
    });
  });

  describe("get", () => {
    it("exists", async () => {
      const result = organizationService.get("1");

      expect(result).toEqual({
        id: "1",
        name: "Test Org",
        identifier: "test",
      });
    });

    it("does not exist", async () => {
      const result = organizationService.get("2");

      expect(result).toBe(undefined);
    });
  });

  it("upsert", async () => {
    await organizationService.upsert(organizationData("2", "Test 2"));

    expect(await firstValueFrom(organizationService.organizations$)).toEqual([
      {
        id: "1",
        name: "Test Org",
        identifier: "test",
      },
      {
        id: "2",
        name: "Test 2",
        identifier: "test",
      },
    ]);
  });

  describe("getByIdentifier", () => {
    it("exists", async () => {
      const result = organizationService.getByIdentifier("test");

      expect(result).toEqual({
        id: "1",
        name: "Test Org",
        identifier: "test",
      });
    });

    it("does not exist", async () => {
      const result = organizationService.getByIdentifier("blah");

      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("exists", async () => {
      await organizationService.delete("1");

      expect(stateService.getOrganizations).toHaveBeenCalledTimes(2);

      expect(stateService.setOrganizations).toHaveBeenCalledTimes(1);
    });

    it("does not exist", async () => {
      organizationService.delete("1");

      expect(stateService.getOrganizations).toHaveBeenCalledTimes(2);
    });
  });

  function organizationData(id: string, name: string) {
    const data = new OrganizationData({} as any);
    data.id = id;
    data.name = name;
    data.identifier = "test";

    return data;
  }
});
