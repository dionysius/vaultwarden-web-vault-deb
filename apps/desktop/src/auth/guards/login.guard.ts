import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

const maxAllowedAccounts = 5;

@Injectable()
export class LoginGuard implements CanActivate {
  protected homepage = "vault";
  constructor(
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
  ) {}

  async canActivate() {
    const accounts = await firstValueFrom(this.stateService.accounts$);
    if (accounts != null && Object.keys(accounts).length >= maxAllowedAccounts) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accountLimitReached"));
      return false;
    }

    return true;
  }
}
