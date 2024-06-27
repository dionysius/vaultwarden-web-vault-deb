import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import zxcvbn from "zxcvbn";

import { PasswordStrengthComponent } from "@bitwarden/angular/tools/password-strength/password-strength.component";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/admin-console/models/domain/master-password-policy-options";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DialogService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

import { OrganizationUserResetPasswordService } from "../services/organization-user-reset-password/organization-user-reset-password.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @Input() name: string;
  @Input() email: string;
  @Input() id: string;
  @Input() organizationId: string;
  @Output() onPasswordReset = new EventEmitter();
  @ViewChild(PasswordStrengthComponent) passwordStrengthComponent: PasswordStrengthComponent;

  enforcedPolicyOptions: MasterPasswordPolicyOptions;
  newPassword: string = null;
  showPassword = false;
  passwordStrengthResult: zxcvbn.ZXCVBNResult;
  formPromise: Promise<any>;

  private destroy$ = new Subject<void>();

  constructor(
    private resetPasswordService: OrganizationUserResetPasswordService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private policyService: PolicyService,
    private logService: LogService,
    private dialogService: DialogService,
  ) {}

  async ngOnInit() {
    this.policyService
      .masterPasswordPolicyOptions$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (enforcedPasswordPolicyOptions) =>
          (this.enforcedPolicyOptions = enforcedPasswordPolicyOptions),
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get loggedOutWarningName() {
    return this.name != null ? this.name : this.i18nService.t("thisUser");
  }

  async generatePassword() {
    const options = (await this.passwordGenerationService.getOptions())?.[0] ?? {};
    this.newPassword = await this.passwordGenerationService.generatePassword(options);
    this.passwordStrengthComponent.updatePasswordStrength(this.newPassword);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    document.getElementById("newPassword").focus();
  }

  copy(value: string) {
    if (value == null) {
      return;
    }

    this.platformUtilsService.copyToClipboard(value, { window: window });
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("password")),
    );
  }

  async submit() {
    // Validation
    if (this.newPassword == null || this.newPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordRequired"),
      );
      return false;
    }

    if (this.newPassword.length < Utils.minimumPasswordLength) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordMinlength", Utils.minimumPasswordLength),
      );
      return false;
    }

    if (
      this.enforcedPolicyOptions != null &&
      !this.policyService.evaluateMasterPassword(
        this.passwordStrengthResult.score,
        this.newPassword,
        this.enforcedPolicyOptions,
      )
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordPolicyRequirementsNotMet"),
      );
      return;
    }

    if (this.passwordStrengthResult.score < 3) {
      const result = await this.dialogService.openSimpleDialog({
        title: { key: "weakMasterPassword" },
        content: { key: "weakMasterPasswordDesc" },
        type: "warning",
      });

      if (!result) {
        return false;
      }
    }

    try {
      this.formPromise = this.resetPasswordService.resetMasterPassword(
        this.newPassword,
        this.email,
        this.id,
        this.organizationId,
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("resetPasswordSuccess"),
      );
      this.onPasswordReset.emit();
    } catch (e) {
      this.logService.error(e);
    }
    this.formPromise = null;
  }

  getStrengthResult(result: zxcvbn.ZXCVBNResult) {
    this.passwordStrengthResult = result;
  }
}
