import { MockProxy, mock } from "jest-mock-extended";
import { firstValueFrom, skip } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FakeStateProvider, mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import {
  SHOW_BANNER_KEY,
  WebUnassignedItemsBannerService,
} from "./web-unassigned-items-banner.service";

describe("WebUnassignedItemsBanner", () => {
  let stateProvider: FakeStateProvider;
  let apiService: MockProxy<ApiService>;

  const sutFactory = () => new WebUnassignedItemsBannerService(stateProvider, apiService);

  beforeEach(() => {
    const fakeAccountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(fakeAccountService);
    apiService = mock();
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
    // skip first value so we get the recomputed value after the server call
    expect(await firstValueFrom(sut.showBanner$.pipe(skip(1)))).toBe(true);
    // Expect to have updated local state
    expect(await firstValueFrom(showBanner.state$)).toBe(true);
    expect(apiService.getShowUnassignedCiphersBanner).toHaveBeenCalledTimes(1);
  });
});
