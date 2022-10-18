import { MockProxy, mock, any, mockClear, matches } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncNotifierService } from "@bitwarden/common/abstractions/sync/syncNotifier.service.abstraction";
import { OrganizationData } from "@bitwarden/common/models/data/organization.data";
import { SyncResponse } from "@bitwarden/common/models/response/sync.response";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";
import { SyncEventArgs } from "@bitwarden/common/types/syncEventArgs";

describe("Organization Service", () => {
  let organizationService: OrganizationService;

  let stateService: MockProxy<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;
  let syncNotifierService: MockProxy<SyncNotifierService>;
  let sync: Subject<SyncEventArgs>;

  const resetStateService = async (
    customizeStateService: (stateService: MockProxy<StateService>) => void
  ) => {
    mockClear(stateService);
    stateService = mock<StateService>();
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;
    customizeStateService(stateService);
    organizationService = new OrganizationService(stateService, syncNotifierService);
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

    sync = new Subject<SyncEventArgs>();

    syncNotifierService = mock<SyncNotifierService>();
    syncNotifierService.sync$ = sync;

    organizationService = new OrganizationService(stateService, syncNotifierService);
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

  describe("syncEvent works", () => {
    it("Complete event updates data", async () => {
      sync.next({
        status: "Completed",
        successfully: true,
        data: new SyncResponse({
          profile: {
            organizations: [
              {
                id: "1",
                name: "Updated Name",
              },
            ],
          },
        }),
      });

      await new Promise((r) => setTimeout(r, 500));

      expect(stateService.setOrganizations).toHaveBeenCalledTimes(1);

      expect(stateService.setOrganizations).toHaveBeenLastCalledWith(
        matches((organizationData: { [id: string]: OrganizationData }) => {
          const organization = organizationData["1"];
          return organization?.name === "Updated Name";
        })
      );
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
