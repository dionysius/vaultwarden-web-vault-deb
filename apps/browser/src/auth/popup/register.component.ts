import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { Router } from "@angular/router";

import { RegisterComponent as BaseRegisterComponent } from "@bitwarden/angular/components/register.component";
import { FormValidationErrorsService } from "@bitwarden/angular/platform/abstractions/form-validation-errors.service";
import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

@Component({
  selector: "app-register",
  templateUrl: "register.component.html",
})
export class RegisterComponent extends BaseRegisterComponent {
  color: string;
  text: string;

  constructor(
    formValidationErrorService: FormValidationErrorsService,
    formBuilder: UntypedFormBuilder,
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    cryptoService: CryptoService,
    apiService: ApiService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    environmentService: EnvironmentService,
    logService: LogService,
    auditService: AuditService,
    dialogService: DialogServiceAbstraction
  ) {
    super(
      formValidationErrorService,
      formBuilder,
      authService,
      router,
      i18nService,
      cryptoService,
      apiService,
      stateService,
      platformUtilsService,
      passwordGenerationService,
      environmentService,
      logService,
      auditService,
      dialogService
    );
  }
}
