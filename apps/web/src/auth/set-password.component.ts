import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SetPasswordComponent as BaseSetPasswordComponent } from "@bitwarden/angular/components/set-password.component";
import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

@Component({
  selector: "app-set-password",
  templateUrl: "set-password.component.html",
})
export class SetPasswordComponent extends BaseSetPasswordComponent {
  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    platformUtilsService: PlatformUtilsService,
    policyApiService: PolicyApiServiceAbstraction,
    policyService: PolicyService,
    router: Router,
    syncService: SyncService,
    route: ActivatedRoute,
    stateService: StateService,
    organizationApiService: OrganizationApiServiceAbstraction,
    organizationUserService: OrganizationUserService,
    dialogService: DialogServiceAbstraction
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyApiService,
      policyService,
      router,
      apiService,
      syncService,
      route,
      stateService,
      organizationApiService,
      organizationUserService,
      dialogService
    );
  }
}
