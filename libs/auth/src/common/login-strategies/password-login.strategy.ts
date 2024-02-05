import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/admin-console/models/domain/master-password-policy-options";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceSetPasswordReason } from "@bitwarden/common/auth/models/domain/force-set-password-reason";
import { PasswordTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/password-token.request";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { IdentityCaptchaResponse } from "@bitwarden/common/auth/models/response/identity-captcha.response";
import { IdentityTokenResponse } from "@bitwarden/common/auth/models/response/identity-token.response";
import { IdentityTwoFactorResponse } from "@bitwarden/common/auth/models/response/identity-two-factor.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { HashPurpose } from "@bitwarden/common/platform/enums";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { MasterKey } from "@bitwarden/common/types/key";

import { LoginStrategyServiceAbstraction } from "../abstractions";
import { PasswordLoginCredentials } from "../models/domain/login-credentials";

import { LoginStrategy } from "./login.strategy";

export class PasswordLoginStrategy extends LoginStrategy {
  get email() {
    return this.tokenRequest.email;
  }

  get masterPasswordHash() {
    return this.tokenRequest.masterPasswordHash;
  }

  tokenRequest: PasswordTokenRequest;

  private localMasterKeyHash: string;
  private masterKey: MasterKey;

  /**
   * Options to track if the user needs to update their password due to a password that does not meet an organization's
   * master password policy.
   */
  private forcePasswordResetReason: ForceSetPasswordReason = ForceSetPasswordReason.None;

  constructor(
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    protected stateService: StateService,
    twoFactorService: TwoFactorService,
    private passwordStrengthService: PasswordStrengthServiceAbstraction,
    private policyService: PolicyService,
    private loginStrategyService: LoginStrategyServiceAbstraction,
  ) {
    super(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService,
    );
  }

  override async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string,
  ): Promise<AuthResult> {
    this.tokenRequest.captchaResponse = captchaResponse ?? this.captchaBypassToken;
    const result = await super.logInTwoFactor(twoFactor);

    // 2FA was successful, save the force update password options with the state service if defined
    if (
      !result.requiresTwoFactor &&
      !result.requiresCaptcha &&
      this.forcePasswordResetReason != ForceSetPasswordReason.None
    ) {
      await this.stateService.setForceSetPasswordReason(this.forcePasswordResetReason);
      result.forcePasswordReset = this.forcePasswordResetReason;
    }

    return result;
  }

  override async logIn(credentials: PasswordLoginCredentials) {
    const { email, masterPassword, captchaToken, twoFactor } = credentials;

    this.masterKey = await this.loginStrategyService.makePreloginKey(masterPassword, email);

    // Hash the password early (before authentication) so we don't persist it in memory in plaintext
    this.localMasterKeyHash = await this.cryptoService.hashMasterKey(
      masterPassword,
      this.masterKey,
      HashPurpose.LocalAuthorization,
    );
    const masterKeyHash = await this.cryptoService.hashMasterKey(masterPassword, this.masterKey);

    this.tokenRequest = new PasswordTokenRequest(
      email,
      masterKeyHash,
      captchaToken,
      await this.buildTwoFactor(twoFactor),
      await this.buildDeviceRequest(),
    );

    const [authResult, identityResponse] = await this.startLogIn();

    const masterPasswordPolicyOptions =
      this.getMasterPasswordPolicyOptionsFromResponse(identityResponse);

    // The identity result can contain master password policies for the user's organizations
    if (masterPasswordPolicyOptions?.enforceOnLogin) {
      // If there is a policy active, evaluate the supplied password before its no longer in memory
      const meetsRequirements = this.evaluateMasterPassword(
        credentials,
        masterPasswordPolicyOptions,
      );

      if (!meetsRequirements) {
        if (authResult.requiresCaptcha || authResult.requiresTwoFactor) {
          // Save the flag to this strategy for later use as the master password is about to pass out of scope
          this.forcePasswordResetReason = ForceSetPasswordReason.WeakMasterPassword;
        } else {
          // Authentication was successful, save the force update password options with the state service
          await this.stateService.setForceSetPasswordReason(
            ForceSetPasswordReason.WeakMasterPassword,
          );
          authResult.forcePasswordReset = ForceSetPasswordReason.WeakMasterPassword;
        }
      }
    }
    return authResult;
  }

  protected override async setMasterKey(response: IdentityTokenResponse) {
    await this.cryptoService.setMasterKey(this.masterKey);
    await this.cryptoService.setMasterKeyHash(this.localMasterKeyHash);
  }

  protected override async setUserKey(response: IdentityTokenResponse): Promise<void> {
    // If migration is required, we won't have a user key to set yet.
    if (this.encryptionKeyMigrationRequired(response)) {
      return;
    }
    await this.cryptoService.setMasterKeyEncryptedUserKey(response.key);

    const masterKey = await this.cryptoService.getMasterKey();
    if (masterKey) {
      const userKey = await this.cryptoService.decryptUserKeyWithMasterKey(masterKey);
      await this.cryptoService.setUserKey(userKey);
    }
  }

  protected override async setPrivateKey(response: IdentityTokenResponse): Promise<void> {
    await this.cryptoService.setPrivateKey(
      response.privateKey ?? (await this.createKeyPairForOldAccount()),
    );
  }

  protected override encryptionKeyMigrationRequired(response: IdentityTokenResponse): boolean {
    return !response.key;
  }

  private getMasterPasswordPolicyOptionsFromResponse(
    response: IdentityTokenResponse | IdentityTwoFactorResponse | IdentityCaptchaResponse,
  ): MasterPasswordPolicyOptions {
    if (response == null || response instanceof IdentityCaptchaResponse) {
      return null;
    }
    return MasterPasswordPolicyOptions.fromResponse(response.masterPasswordPolicy);
  }

  private evaluateMasterPassword(
    { masterPassword, email }: PasswordLoginCredentials,
    options: MasterPasswordPolicyOptions,
  ): boolean {
    const passwordStrength = this.passwordStrengthService.getPasswordStrength(
      masterPassword,
      email,
    )?.score;

    return this.policyService.evaluateMasterPassword(passwordStrength, masterPassword, options);
  }
}
