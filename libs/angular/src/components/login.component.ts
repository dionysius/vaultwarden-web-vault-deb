import { Directive, NgZone, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";

import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import {
  AllValidationErrors,
  FormValidationErrorsService,
} from "@bitwarden/common/abstractions/formValidationErrors.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { AuthResult } from "@bitwarden/common/models/domain/authResult";
import { PasswordLogInCredentials } from "@bitwarden/common/models/domain/logInCredentials";

import { CaptchaProtectedComponent } from "./captchaProtected.component";

@Directive()
export class LoginComponent extends CaptchaProtectedComponent implements OnInit {
  showPassword = false;
  formPromise: Promise<AuthResult>;
  onSuccessfulLogin: () => Promise<any>;
  onSuccessfulLoginNavigate: () => Promise<any>;
  onSuccessfulLoginTwoFactorNavigate: () => Promise<any>;
  onSuccessfulLoginForceResetNavigate: () => Promise<any>;
  selfHosted = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    masterPassword: ["", [Validators.required, Validators.minLength(8)]],
    rememberEmail: [true],
  });

  protected twoFactorRoute = "2fa";
  protected successRoute = "vault";
  protected forcePasswordResetRoute = "update-temp-password";
  protected alwaysRememberEmail = false;

  constructor(
    protected authService: AuthService,
    protected router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    protected stateService: StateService,
    environmentService: EnvironmentService,
    protected passwordGenerationService: PasswordGenerationService,
    protected cryptoFunctionService: CryptoFunctionService,
    protected logService: LogService,
    protected ngZone: NgZone,
    protected formBuilder: FormBuilder,
    protected formValidationErrorService: FormValidationErrorsService
  ) {
    super(environmentService, i18nService, platformUtilsService);
    this.selfHosted = platformUtilsService.isSelfHost();
  }

  get selfHostedDomain() {
    return this.environmentService.hasBaseUrl() ? this.environmentService.getWebVaultUrl() : null;
  }

  async ngOnInit() {
    let email = this.formGroup.value.email;
    if (email == null || email === "") {
      email = await this.stateService.getRememberedEmail();
      this.formGroup.get("email")?.setValue(email);

      if (email == null) {
        this.formGroup.get("email")?.setValue("");
      }
    }
    if (!this.alwaysRememberEmail) {
      const rememberEmail = (await this.stateService.getRememberedEmail()) != null;
      this.formGroup.get("rememberEmail")?.setValue(rememberEmail);
    }
  }

  async submit(showToast = true) {
    const data = this.formGroup.value;

    await this.setupCaptcha();

    this.formGroup.markAllAsTouched();

    //web
    if (this.formGroup.invalid && !showToast) {
      return;
    }

    //desktop, browser; This should be removed once all clients use reactive forms
    if (this.formGroup.invalid && showToast) {
      const errorText = this.getErrorToastMessage();
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), errorText);
      return;
    }

    try {
      const credentials = new PasswordLogInCredentials(
        data.email,
        data.masterPassword,
        this.captchaToken,
        null
      );
      this.formPromise = this.authService.logIn(credentials);
      const response = await this.formPromise;
      if (data.rememberEmail || this.alwaysRememberEmail) {
        await this.stateService.setRememberedEmail(data.email);
      } else {
        await this.stateService.setRememberedEmail(null);
      }
      if (this.handleCaptchaRequired(response)) {
        return;
      } else if (response.requiresTwoFactor) {
        if (this.onSuccessfulLoginTwoFactorNavigate != null) {
          this.onSuccessfulLoginTwoFactorNavigate();
        } else {
          this.router.navigate([this.twoFactorRoute]);
        }
      } else if (response.forcePasswordReset) {
        if (this.onSuccessfulLoginForceResetNavigate != null) {
          this.onSuccessfulLoginForceResetNavigate();
        } else {
          this.router.navigate([this.forcePasswordResetRoute]);
        }
      } else {
        const disableFavicon = await this.stateService.getDisableFavicon();
        await this.stateService.setDisableFavicon(!!disableFavicon);
        if (this.onSuccessfulLogin != null) {
          this.onSuccessfulLogin();
        }
        if (this.onSuccessfulLoginNavigate != null) {
          this.onSuccessfulLoginNavigate();
        } else {
          this.router.navigate([this.successRoute]);
        }
      }
    } catch (e) {
      this.logService.error(e);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    if (this.ngZone.isStable) {
      document.getElementById("masterPassword").focus();
    } else {
      this.ngZone.onStable
        .pipe(take(1))
        .subscribe(() => document.getElementById("masterPassword").focus());
    }
  }

  async launchSsoBrowser(clientId: string, ssoRedirectUri: string) {
    // Generate necessary sso params
    const passwordOptions: any = {
      type: "password",
      length: 64,
      uppercase: true,
      lowercase: true,
      numbers: true,
      special: false,
    };
    const state = await this.passwordGenerationService.generatePassword(passwordOptions);
    const ssoCodeVerifier = await this.passwordGenerationService.generatePassword(passwordOptions);
    const codeVerifierHash = await this.cryptoFunctionService.hash(ssoCodeVerifier, "sha256");
    const codeChallenge = Utils.fromBufferToUrlB64(codeVerifierHash);

    // Save sso params
    await this.stateService.setSsoState(state);
    await this.stateService.setSsoCodeVerifier(ssoCodeVerifier);

    // Build URI
    const webUrl = this.environmentService.getWebVaultUrl();

    // Launch browser
    this.platformUtilsService.launchUri(
      webUrl +
        "/#/sso?clientId=" +
        clientId +
        "&redirectUri=" +
        encodeURIComponent(ssoRedirectUri) +
        "&state=" +
        state +
        "&codeChallenge=" +
        codeChallenge
    );
  }

  private getErrorToastMessage() {
    const error: AllValidationErrors = this.formValidationErrorService
      .getFormValidationErrors(this.formGroup.controls)
      .shift();

    if (error) {
      switch (error.errorName) {
        case "email":
          return this.i18nService.t("invalidEmail");
        default:
          return this.i18nService.t(this.errorTag(error));
      }
    }

    return;
  }

  private errorTag(error: AllValidationErrors): string {
    const name = error.errorName.charAt(0).toUpperCase() + error.errorName.slice(1);
    return `${error.controlName}${name}`;
  }

  protected focusInput() {
    const email = this.formGroup.value.email;
    document.getElementById(email == null || email === "" ? "email" : "masterPassword").focus();
  }
}
