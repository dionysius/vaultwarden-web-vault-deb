import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { Verification } from "@bitwarden/common/types/verification";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { DialogService } from "@bitwarden/components";

interface EnrollMasterPasswordResetData {
  organization: Organization;
}

@Component({
  selector: "app-enroll-master-password-reset",
  templateUrl: "enroll-master-password-reset.component.html",
})
export class EnrollMasterPasswordReset {
  protected organization: Organization;

  protected formGroup = new FormGroup({
    verification: new FormControl<Verification>(null, Validators.required),
  });

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) protected data: EnrollMasterPasswordResetData,
    private userVerificationService: UserVerificationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private cryptoService: CryptoService,
    private syncService: SyncService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private organizationUserService: OrganizationUserService
  ) {
    this.organization = data.organization;
  }

  submit = async () => {
    let toastStringRef = "withdrawPasswordResetSuccess";

    try {
      await this.userVerificationService
        .buildRequest(
          this.formGroup.value.verification,
          OrganizationUserResetPasswordEnrollmentRequest
        )
        .then(async (request) => {
          // Set variables
          let keyString: string = null;

          // Retrieve Public Key
          const orgKeys = await this.organizationApiService.getKeys(this.organization.id);
          if (orgKeys == null) {
            throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
          }

          const publicKey = Utils.fromB64ToArray(orgKeys.publicKey);

          // RSA Encrypt user's encKey.key with organization public key
          const userKey = await this.cryptoService.getUserKey();
          const encryptedKey = await this.cryptoService.rsaEncrypt(userKey.key, publicKey);
          keyString = encryptedKey.encryptedString;
          toastStringRef = "enrollPasswordResetSuccess";

          // Create request and execute enrollment
          request.resetPasswordKey = keyString;
          await this.organizationUserService.putOrganizationUserResetPasswordEnrollment(
            this.organization.id,
            this.organization.userId,
            request
          );

          await this.syncService.fullSync(true);
        });
      this.platformUtilsService.showToast("success", null, this.i18nService.t(toastStringRef));
      this.dialogRef.close();
    } catch (e) {
      this.logService.error(e);
    }
  };

  static open(dialogService: DialogService, data: EnrollMasterPasswordResetData) {
    return dialogService.open(EnrollMasterPasswordReset, { data });
  }
}
