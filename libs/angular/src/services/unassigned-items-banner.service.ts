import { Injectable } from "@angular/core";
import { combineLatest, concatMap, map, startWith } from "rxjs";

import {
  OrganizationService,
  canAccessOrgAdmin,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import {
  EnvironmentService,
  Region,
} from "@bitwarden/common/platform/abstractions/environment.service";
import {
  StateProvider,
  UNASSIGNED_ITEMS_BANNER_DISK,
  UserKeyDefinition,
} from "@bitwarden/common/platform/state";

import { UnassignedItemsBannerApiService } from "./unassigned-items-banner.api.service";

export const SHOW_BANNER_KEY = new UserKeyDefinition<boolean>(
  UNASSIGNED_ITEMS_BANNER_DISK,
  "showBanner",
  {
    deserializer: (b) => b,
    clearOn: [],
  },
);

/** Displays a banner that tells users how to move their unassigned items into a collection. */
@Injectable({ providedIn: "root" })
export class UnassignedItemsBannerService {
  private _showBanner = this.stateProvider.getActive(SHOW_BANNER_KEY);

  showBanner$ = this._showBanner.state$.pipe(
    concatMap(async (showBannerState) => {
      // null indicates that the user has not seen or dismissed the banner yet - get the flag from server
      if (showBannerState == null) {
        const showBannerResponse = await this.apiService.getShowUnassignedCiphersBanner();
        await this._showBanner.update(() => showBannerResponse);
        return showBannerResponse;
      }

      return showBannerState;
    }),
  );

  private adminConsoleOrg$ = this.organizationService.organizations$.pipe(
    map((orgs) => orgs.find((o) => canAccessOrgAdmin(o))),
  );

  adminConsoleUrl$ = combineLatest([
    this.adminConsoleOrg$,
    this.environmentService.environment$,
  ]).pipe(
    map(([org, environment]) => {
      if (org == null || environment == null) {
        return "#";
      }

      return environment.getWebVaultUrl() + "/#/organizations/" + org.id;
    }),
  );

  bannerText$ = this.environmentService.environment$.pipe(
    map((e) =>
      e?.getRegion() == Region.SelfHosted
        ? "unassignedItemsBannerSelfHostNotice"
        : "unassignedItemsBannerNotice",
    ),
  );

  loading$ = combineLatest([this.adminConsoleUrl$, this.bannerText$]).pipe(
    startWith(true),
    map(() => false),
  );

  constructor(
    private stateProvider: StateProvider,
    private apiService: UnassignedItemsBannerApiService,
    private environmentService: EnvironmentService,
    private organizationService: OrganizationService,
  ) {}

  async hideBanner() {
    await this._showBanner.update(() => false);
  }
}
