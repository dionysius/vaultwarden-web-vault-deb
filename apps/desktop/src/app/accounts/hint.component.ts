import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { HintComponent as BaseHintComponent } from "@bitwarden/angular/components/hint.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LoginService } from "@bitwarden/common/abstractions/login.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-hint",
  templateUrl: "hint.component.html",
})
export class HintComponent extends BaseHintComponent {
  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    apiService: ApiService,
    logService: LogService,
    loginService: LoginService
  ) {
    super(router, i18nService, apiService, platformUtilsService, logService, loginService);
  }
}
