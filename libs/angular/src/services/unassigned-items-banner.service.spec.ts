import { MockProxy, mock } from "jest-mock-extended";
import { firstValueFrom, of } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { FakeStateProvider, mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import { UnassignedItemsBannerApiService } from "./unassigned-items-banner.api.service";
import { SHOW_BANNER_KEY, UnassignedItemsBannerService } from "./unassigned-items-banner.service";

describe("UnassignedItemsBanner", () => {
  let stateProvider: FakeStateProvider;
  let apiService: MockProxy<UnassignedItemsBannerApiService>;
  let environmentService: MockProxy<EnvironmentService>;
  let organizationService: MockProxy<OrganizationService>;

  const sutFactory = () =>
    new UnassignedItemsBannerService(
      stateProvider,
      apiService,
      environmentService,
      organizationService,
    );

  beforeEach(() => {
    const fakeAccountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(fakeAccountService);
    apiService = mock();
    environmentService = mock();
    environmentService.environment$ = of(null);
    organizationService = mock();
    organizationService.organizations$ = of([]);
  });

  it("shows the banner if showBanner local state is true", async () => {
    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(true);

    const sut = sutFactory();
    expect(await firstValueFrom(sut.showBanner$)).toBe(true);
    expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
  });

  it("does not show the banner if showBanner local state is false", async () => {
    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(false);

    const sut = sutFactory();
    expect(await firstValueFrom(sut.showBanner$)).toBe(false);
    expect(apiService.getShowUnassignedCiphersBanner).not.toHaveBeenCalled();
  });

  it("fetches from server if local state has not been set yet", async () => {
    apiService.getShowUnassignedCiphersBanner.mockResolvedValue(true);

    const showBanner = stateProvider.activeUser.getFake(SHOW_BANNER_KEY);
    showBanner.nextState(undefined);

    const sut = sutFactory();

    expect(await firstValueFrom(sut.showBanner$)).toBe(true);
    expect(apiService.getShowUnassignedCiphersBanner).toHaveBeenCalledTimes(1);
  });
});
