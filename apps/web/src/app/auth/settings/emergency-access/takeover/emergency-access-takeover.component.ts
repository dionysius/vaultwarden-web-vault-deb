import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { takeUntil } from "rxjs";

import { ChangePasswordComponent } from "@bitwarden/angular/auth/components/change-password.component";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { KdfType } from "@bitwarden/common/platform/enums";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";
import { DialogService } from "@bitwarden/components";

import { EmergencyAccessService } from "../../../emergency-access";

@Component({
  selector: "emergency-access-takeover",
  templateUrl: "emergency-access-takeover.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class EmergencyAccessTakeoverComponent
  extends ChangePasswordComponent
  implements OnInit, OnDestroy
{
  @Output() onDone = new EventEmitter();
  @Input() emergencyAccessId: string;
  @Input() name: string;
  @Input() email: string;
  @Input() kdf: KdfType;
  @Input() kdfIterations: number;

  formPromise: Promise<any>;

  constructor(
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    stateService: StateService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private emergencyAccessService: EmergencyAccessService,
    private logService: LogService,
    dialogService: DialogService,
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      stateService,
      dialogService,
    );
  }

  async ngOnInit() {
    const policies = await this.emergencyAccessService.getGrantorPolicies(this.emergencyAccessId);
    this.policyService
      .masterPasswordPolicyOptions$(policies)
      .pipe(takeUntil(this.destroy$))
      .subscribe((enforcedPolicyOptions) => (this.enforcedPolicyOptions = enforcedPolicyOptions));
  }

  // eslint-disable-next-line rxjs-angular/prefer-takeuntil
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  async submit() {
    if (!(await this.strongPassword())) {
      return;
    }

    try {
      await this.emergencyAccessService.takeover(
        this.emergencyAccessId,
        this.masterPassword,
        this.email,
      );
      this.onDone.emit();
    } catch (e) {
      this.logService.error(e);
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("unexpectedError"),
      );
    }
  }
}
