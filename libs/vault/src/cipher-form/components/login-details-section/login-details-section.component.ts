import { DatePipe, NgIf } from "@angular/common";
import { Component, inject, OnInit, Optional } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";
import {
  AsyncActionsModule,
  CardComponent,
  FormFieldModule,
  IconButtonModule,
  PopoverModule,
  SectionComponent,
  SectionHeaderComponent,
  ToastService,
  TypographyModule,
} from "@bitwarden/components";

import { CipherFormGenerationService } from "../../abstractions/cipher-form-generation.service";
import { TotpCaptureService } from "../../abstractions/totp-capture.service";
import { CipherFormContainer } from "../../cipher-form-container";

@Component({
  selector: "vault-login-details-section",
  templateUrl: "./login-details-section.component.html",
  standalone: true,
  imports: [
    SectionComponent,
    ReactiveFormsModule,
    SectionHeaderComponent,
    TypographyModule,
    JslibModule,
    CardComponent,
    FormFieldModule,
    IconButtonModule,
    AsyncActionsModule,
    NgIf,
    PopoverModule,
  ],
})
export class LoginDetailsSectionComponent implements OnInit {
  loginDetailsForm = this.formBuilder.group({
    username: [""],
    password: [""],
    totp: [""],
  });

  /**
   * Whether the TOTP field can be captured from the current tab. Only available in the browser extension.
   */
  get canCaptureTotp() {
    return this.totpCaptureService != null && this.loginDetailsForm.controls.totp.enabled;
  }

  private datePipe = inject(DatePipe);

  private loginView: LoginView;

  get hasPasskey(): boolean {
    return this.loginView?.hasFido2Credentials;
  }

  get fido2CredentialCreationDateValue(): string {
    const dateCreated = this.i18nService.t("dateCreated");
    const creationDate = this.datePipe.transform(
      this.loginView?.fido2Credentials?.[0]?.creationDate,
      "short",
    );
    return `${dateCreated} ${creationDate}`;
  }

  get viewHiddenFields() {
    if (this.cipherFormContainer.originalCipherView) {
      return this.cipherFormContainer.originalCipherView.viewPassword;
    }
    return true;
  }

  constructor(
    private cipherFormContainer: CipherFormContainer,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private generationService: CipherFormGenerationService,
    private auditService: AuditService,
    private toastService: ToastService,
    @Optional() private totpCaptureService?: TotpCaptureService,
  ) {
    this.cipherFormContainer.registerChildForm("loginDetails", this.loginDetailsForm);

    this.loginDetailsForm.valueChanges
      .pipe(
        takeUntilDestroyed(),
        // getRawValue() is used as fields can be disabled when passwords are hidden
        map(() => this.loginDetailsForm.getRawValue()),
      )
      .subscribe((value) => {
        Object.assign(this.loginView, {
          username: value.username,
          password: value.password,
          totp: value.totp,
        } as LoginView);

        this.cipherFormContainer.patchCipher({
          login: this.loginView,
        });
      });
  }

  async ngOnInit() {
    this.loginView = new LoginView();
    if (this.cipherFormContainer.originalCipherView?.login) {
      this.initFromExistingCipher(this.cipherFormContainer.originalCipherView.login);
    } else {
      await this.initNewCipher();
    }

    if (this.cipherFormContainer.config.mode === "partial-edit") {
      this.loginDetailsForm.disable();
    }
  }

  private initFromExistingCipher(existingLogin: LoginView) {
    // Note: this.loginView will still contain references to the existing login's Uri and Fido2Credential arrays.
    // We may need to deep clone these in the future.
    Object.assign(this.loginView, existingLogin);
    this.loginDetailsForm.patchValue({
      username: this.loginView.username,
      password: this.loginView.password,
      totp: this.loginView.totp,
    });

    if (!this.viewHiddenFields) {
      this.loginDetailsForm.controls.password.disable();
      this.loginDetailsForm.controls.totp.disable();
    }
  }

  private async initNewCipher() {
    this.loginDetailsForm.controls.password.patchValue(
      await this.generationService.generateInitialPassword(),
    );
  }

  captureTotp = async () => {
    if (!this.canCaptureTotp) {
      return;
    }
    try {
      const totp = await this.totpCaptureService.captureTotpSecret();
      if (totp) {
        this.loginDetailsForm.controls.totp.patchValue(totp);
        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("totpCaptureSuccess"),
        });
      }
    } catch {
      this.toastService.showToast({
        variant: "error",
        title: this.i18nService.t("errorOccurred"),
        message: this.i18nService.t("totpCaptureError"),
      });
    }
  };

  removePasskey = async () => {
    // Fido2Credentials do not have a form control, so update directly
    this.loginView.fido2Credentials = null;
    this.cipherFormContainer.patchCipher({
      login: this.loginView,
    });
  };

  /**
   * Generate a new password and update the form.
   * TODO: Browser extension needs a means to cache the current form so values are not lost upon navigating to the generator.
   */
  generatePassword = async () => {
    const newPassword = await this.generationService.generatePassword();

    if (newPassword) {
      this.loginDetailsForm.controls.password.patchValue(newPassword);
    }
  };

  /**
   * Generate a new username and update the form.
   * TODO: Browser extension needs a means to cache the current form so values are not lost upon navigating to the generator.
   */
  generateUsername = async () => {
    const newUsername = await this.generationService.generateUsername();
    if (newUsername) {
      this.loginDetailsForm.controls.username.patchValue(newUsername);
    }
  };

  /**
   * Checks if the password has been exposed in a data breach using the AuditService.
   */
  checkPassword = async () => {
    const password = this.loginDetailsForm.controls.password.value;

    if (password == null || password === "") {
      return;
    }

    const matches = await this.auditService.passwordLeaked(password);

    if (matches > 0) {
      this.toastService.showToast({
        variant: "warning",
        title: null,
        message: this.i18nService.t("passwordExposed", matches.toString()),
      });
    } else {
      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("passwordSafe"),
      });
    }
  };
}
