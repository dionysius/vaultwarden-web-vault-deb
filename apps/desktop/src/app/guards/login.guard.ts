import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

const maxAllowedAccounts = 5;

@Injectable()
export class LoginGuard implements CanActivate {
  protected homepage = "vault";
  constructor(
    private stateService: StateService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async canActivate() {
    const accounts = this.stateService.accounts.getValue();
    if (accounts != null && Object.keys(accounts).length >= maxAllowedAccounts) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accountLimitReached"));
      return false;
    }

    return true;
  }
}
