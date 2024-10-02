import { Router } from "@angular/router";
import { ReplaySubject } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import {
  Environment,
  Region,
  RegionConfig,
  Urls,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  CloudEnvironment,
  DefaultEnvironmentService,
  SelfHostedEnvironment,
} from "@bitwarden/common/platform/services/default-environment.service";
import { StateProvider } from "@bitwarden/common/platform/state";

/**
 * Web specific environment service. Ensures that the urls are set from the window location.
 */
export class WebEnvironmentService extends DefaultEnvironmentService {
  constructor(
    private win: Window,
    stateProvider: StateProvider,
    accountService: AccountService,
    private router: Router,
  ) {
    super(stateProvider, accountService);

    // The web vault always uses the current location as the base url
    const urls = process.env.URLS as Urls;
    urls.base ??= this.win.location.origin;

    // Find the region
    const domain = Utils.getDomain(this.win.location.href);
    const region = this.availableRegions().find((r) => Utils.getDomain(r.urls.webVault) === domain);

    let environment: Environment;
    if (region) {
      environment = new WebCloudEnvironment(region, urls);
    } else {
      environment = new SelfHostedEnvironment(urls);
    }

    // Override the environment observable with a replay subject
    const subject = new ReplaySubject<Environment>(1);
    subject.next(environment);
    this.environment$ = subject.asObservable();
  }

  // Web setting env means navigating to a new location
  setEnvironment(region: Region, urls?: Urls): Promise<Urls> {
    if (region === Region.SelfHosted) {
      throw new Error("setEnvironment does not work in web for self-hosted.");
    }

    const currentDomain = Utils.getDomain(this.win.location.href);
    const currentRegion = this.availableRegions().find(
      (r) => Utils.getDomain(r.urls.webVault) === currentDomain,
    );

    if (currentRegion.key === region) {
      // They have selected the current region, nothing to do
      return Promise.resolve(currentRegion.urls);
    }

    const chosenRegion = this.availableRegions().find((r) => r.key === region);

    if (chosenRegion == null) {
      throw new Error("The selected region is not known as an available region.");
    }

    // Preserve the current in app route + params in the new location
    const routeAndParams = `/#${this.router.url}`;
    this.win.location.href = chosenRegion.urls.webVault + routeAndParams;

    // This return shouldn't matter as we are about to leave the current window
    return Promise.resolve(chosenRegion.urls);
  }
}

class WebCloudEnvironment extends CloudEnvironment {
  constructor(config: RegionConfig, urls: Urls) {
    super(config);
    // We override the urls to avoid CORS issues
    this.urls = urls;
  }
}
