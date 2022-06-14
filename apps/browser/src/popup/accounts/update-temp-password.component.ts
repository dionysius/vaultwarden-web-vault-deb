import { Component } from "@angular/core";

import { UpdateTempPasswordComponent as BaseUpdateTempPasswordComponent } from "@bitwarden/angular/components/update-temp-password.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync.service";

interface MasterPasswordScore {
  Color: string;
  Text: string;
  Width: number;
}

@Component({
  selector: "app-update-temp-password",
  templateUrl: "update-temp-password.component.html",
})
export class UpdateTempPasswordComponent extends BaseUpdateTempPasswordComponent {
  get masterPasswordScoreStyle(): MasterPasswordScore {
    const scoreWidth = this.masterPasswordScore == null ? 0 : (this.masterPasswordScore + 1) * 20;
    switch (this.masterPasswordScore) {
      case 4:
        return {
          Color: "bg-success",
          Text: "strong",
          Width: scoreWidth,
        };
      case 3:
        return {
          Color: "bg-primary",
          Text: "good",
          Width: scoreWidth,
        };
      case 2:
        return {
          Color: "bg-warning",
          Text: "weak",
          Width: scoreWidth,
        };
      default:
        return {
          Color: "bg-danger",
          Text: "weak",
          Width: scoreWidth,
        };
    }
  }

  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationService,
    policyService: PolicyService,
    cryptoService: CryptoService,
    stateService: StateService,
    messagingService: MessagingService,
    apiService: ApiService,
    syncService: SyncService,
    logService: LogService
  ) {
    super(
      i18nService,
      platformUtilsService,
      passwordGenerationService,
      policyService,
      cryptoService,
      messagingService,
      apiService,
      stateService,
      syncService,
      logService
    );
  }
}
