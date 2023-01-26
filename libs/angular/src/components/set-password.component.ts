import { Directive } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { SyncService } from "@bitwarden/common/abstractions/sync/sync.service.abstraction";
import { HashPurpose } from "@bitwarden/common/enums/hashPurpose";
import { DEFAULT_KDF_TYPE, DEFAULT_PBKDF2_ITERATIONS } from "@bitwarden/common/enums/kdfType";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { KeysRequest } from "@bitwarden/common/models/request/keys.request";
import { SetPasswordRequest } from "@bitwarden/common/models/request/set-password.request";

import { ChangePasswordComponent as BaseChangePasswordComponent } from "./change-password.component";

@Directive()
export class SetPasswordComponent extends BaseChangePasswordComponent {
  syncLoading = true;
  showPassword = false;
  hint = "";
  identifier: string = null;
  orgId: string;
  resetPasswordAutoEnroll = false;

  onSuccessfulChangePassword: () => Promise<void>;
  successRoute = "vault";

  constructor(
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    private policyApiService: PolicyApiServiceAbstraction,
    policyService: PolicyService,
    protected router: Router,
    private apiService: ApiService,
    private syncService: SyncService,
    private route: ActivatedRoute,
    stateService: StateService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private organizationUserService: OrganizationUserService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      stateService
    );
  }

  async ngOnInit() {
    await this.syncService.fullSync(true);
    this.syncLoading = false;

    // eslint-disable-next-line rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.identifier != null) {
        this.identifier = qParams.identifier;
      }
    });

    // Automatic Enrollment Detection
    if (this.identifier != null) {
      try {
        const response = await this.organizationApiService.getAutoEnrollStatus(this.identifier);
        this.orgId = response.id;
        this.resetPasswordAutoEnroll = response.resetPasswordEnabled;
        this.enforcedPolicyOptions =
          await this.policyApiService.getMasterPasswordPoliciesForInvitedUsers(this.orgId);
      } catch {
        this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
      }
    }

    super.ngOnInit();
  }

  async setupSubmitActions() {
    this.kdf = DEFAULT_KDF_TYPE;
    this.kdfIterations = DEFAULT_PBKDF2_ITERATIONS;
    return true;
  }

  async performSubmitActions(
    masterPasswordHash: string,
    key: SymmetricCryptoKey,
    encKey: [SymmetricCryptoKey, EncString]
  ) {
    const keys = await this.cryptoService.makeKeyPair(encKey[0]);
    const request = new SetPasswordRequest(
      masterPasswordHash,
      encKey[1].encryptedString,
      this.hint,
      this.kdf,
      this.kdfIterations,
      this.identifier,
      new KeysRequest(keys[0], keys[1].encryptedString)
    );
    try {
      if (this.resetPasswordAutoEnroll) {
        this.formPromise = this.apiService
          .setPassword(request)
          .then(async () => {
            await this.onSetPasswordSuccess(key, encKey, keys);
            return this.organizationApiService.getKeys(this.orgId);
          })
          .then(async (response) => {
            if (response == null) {
              throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
            }
            const userId = await this.stateService.getUserId();
            const publicKey = Utils.fromB64ToArray(response.publicKey);

            // RSA Encrypt user's encKey.key with organization public key
            const userEncKey = await this.cryptoService.getEncKey();
            const encryptedKey = await this.cryptoService.rsaEncrypt(
              userEncKey.key,
              publicKey.buffer
            );

            const resetRequest = new OrganizationUserResetPasswordEnrollmentRequest();
            resetRequest.masterPasswordHash = masterPasswordHash;
            resetRequest.resetPasswordKey = encryptedKey.encryptedString;

            return this.organizationUserService.putOrganizationUserResetPasswordEnrollment(
              this.orgId,
              userId,
              resetRequest
            );
          });
      } else {
        this.formPromise = this.apiService.setPassword(request).then(async () => {
          await this.onSetPasswordSuccess(key, encKey, keys);
        });
      }

      await this.formPromise;

      if (this.onSuccessfulChangePassword != null) {
        this.onSuccessfulChangePassword();
      } else {
        this.router.navigate([this.successRoute]);
      }
    } catch {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }
  }

  togglePassword(confirmField: boolean) {
    this.showPassword = !this.showPassword;
    document.getElementById(confirmField ? "masterPasswordRetype" : "masterPassword").focus();
  }

  private async onSetPasswordSuccess(
    key: SymmetricCryptoKey,
    encKey: [SymmetricCryptoKey, EncString],
    keys: [string, EncString]
  ) {
    await this.stateService.setKdfType(this.kdf);
    await this.stateService.setKdfIterations(this.kdfIterations);
    await this.cryptoService.setKey(key);
    await this.cryptoService.setEncKey(encKey[1].encryptedString);
    await this.cryptoService.setEncPrivateKey(keys[1].encryptedString);

    const localKeyHash = await this.cryptoService.hashPassword(
      this.masterPassword,
      key,
      HashPurpose.LocalAuthorization
    );
    await this.cryptoService.setKeyHash(localKeyHash);
  }
}
