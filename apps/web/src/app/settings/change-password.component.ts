import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

import { ChangePasswordComponent as BaseChangePasswordComponent } from "@bitwarden/angular/components/change-password.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { EmergencyAccessStatusType } from "@bitwarden/common/enums/emergencyAccessStatusType";
import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { EmergencyAccessUpdateRequest } from "@bitwarden/common/models/request/emergency-access-update.request";
import { PasswordRequest } from "@bitwarden/common/models/request/password.request";
import { SendWithIdRequest } from "@bitwarden/common/models/request/send-with-id.request";
import { UpdateKeyRequest } from "@bitwarden/common/models/request/update-key.request";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { CipherWithIdRequest } from "@bitwarden/common/vault/models/request/cipher-with-id.request";
import { FolderWithIdRequest } from "@bitwarden/common/vault/models/request/folder-with-id.request";

@Component({
  selector: "app-change-password",
  templateUrl: "change-password.component.html",
})
export class ChangePasswordComponent extends BaseChangePasswordComponent {
  rotateEncKey = false;
  currentMasterPassword: string;
  masterPasswordHint: string;

  constructor(
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    stateService: StateService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private folderService: FolderService,
    private cipherService: CipherService,
    private syncService: SyncService,
    private apiService: ApiService,
    private sendService: SendService,
    private organizationService: OrganizationService,
    private keyConnectorService: KeyConnectorService,
    private router: Router,
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
    if (await this.keyConnectorService.getUsesKeyConnector()) {
      this.router.navigate(["/settings/security/two-factor"]);
    }

    this.masterPasswordHint = (await this.apiService.getProfile()).masterPasswordHint;
    await super.ngOnInit();
  }

  async rotateEncKeyClicked() {
    if (this.rotateEncKey) {
      const ciphers = await this.cipherService.getAllDecrypted();
      let hasOldAttachments = false;
      if (ciphers != null) {
        for (let i = 0; i < ciphers.length; i++) {
          if (ciphers[i].organizationId == null && ciphers[i].hasOldAttachments) {
            hasOldAttachments = true;
            break;
          }
        }
      }

      if (hasOldAttachments) {
        const learnMore = await this.platformUtilsService.showDialog(
          this.i18nService.t("oldAttachmentsNeedFixDesc"),
          null,
          this.i18nService.t("learnMore"),
          this.i18nService.t("close"),
          "warning"
        );
        if (learnMore) {
          this.platformUtilsService.launchUri(
            "https://bitwarden.com/help/attachments/#add-storage-space"
          );
        }
        this.rotateEncKey = false;
        return;
      }

      const result = await this.platformUtilsService.showDialog(
        this.i18nService.t("updateEncryptionKeyWarning") +
          " " +
          this.i18nService.t("updateEncryptionKeyExportWarning") +
          " " +
          this.i18nService.t("rotateEncKeyConfirmation"),
        this.i18nService.t("rotateEncKeyTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );
      if (!result) {
        this.rotateEncKey = false;
      }
    }
  }

  async submit() {
    const hasEncKey = await this.cryptoService.hasEncKey();
    if (!hasEncKey) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("updateKey"));
      return;
    }

    await super.submit();
  }

  async setupSubmitActions() {
    if (this.currentMasterPassword == null || this.currentMasterPassword === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("masterPasswordRequired")
      );
      return false;
    }

    if (this.rotateEncKey) {
      await this.syncService.fullSync(true);
    }

    return super.setupSubmitActions();
  }

  async performSubmitActions(
    newMasterPasswordHash: string,
    newKey: SymmetricCryptoKey,
    newEncKey: [SymmetricCryptoKey, EncString]
  ) {
    const request = new PasswordRequest();
    request.masterPasswordHash = await this.cryptoService.hashPassword(
      this.currentMasterPassword,
      null
    );
    request.masterPasswordHint = this.masterPasswordHint;
    request.newMasterPasswordHash = newMasterPasswordHash;
    request.key = newEncKey[1].encryptedString;

    try {
      if (this.rotateEncKey) {
        this.formPromise = this.apiService.postPassword(request).then(() => {
          return this.updateKey(newKey, request.newMasterPasswordHash);
        });
      } else {
        this.formPromise = this.apiService.postPassword(request);
      }

      await this.formPromise;

      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("masterPasswordChanged"),
        this.i18nService.t("logBackIn")
      );
      this.messagingService.send("logout");
    } catch {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }
  }

  private async updateKey(key: SymmetricCryptoKey, masterPasswordHash: string) {
    const encKey = await this.cryptoService.makeEncKey(key);
    const privateKey = await this.cryptoService.getPrivateKey();
    let encPrivateKey: EncString = null;
    if (privateKey != null) {
      encPrivateKey = await this.cryptoService.encrypt(privateKey, encKey[0]);
    }
    const request = new UpdateKeyRequest();
    request.privateKey = encPrivateKey != null ? encPrivateKey.encryptedString : null;
    request.key = encKey[1].encryptedString;
    request.masterPasswordHash = masterPasswordHash;

    const folders = await firstValueFrom(this.folderService.folderViews$);
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id == null) {
        continue;
      }
      const folder = await this.folderService.encrypt(folders[i], encKey[0]);
      request.folders.push(new FolderWithIdRequest(folder));
    }

    const ciphers = await this.cipherService.getAllDecrypted();
    for (let i = 0; i < ciphers.length; i++) {
      if (ciphers[i].organizationId != null) {
        continue;
      }

      const cipher = await this.cipherService.encrypt(ciphers[i], encKey[0]);
      request.ciphers.push(new CipherWithIdRequest(cipher));
    }

    const sends = await this.sendService.getAll();
    await Promise.all(
      sends.map(async (send) => {
        const cryptoKey = await this.cryptoService.decryptToBytes(send.key, null);
        send.key = (await this.cryptoService.encrypt(cryptoKey, encKey[0])) ?? send.key;
        request.sends.push(new SendWithIdRequest(send));
      })
    );

    await this.apiService.postAccountKey(request);

    await this.updateEmergencyAccesses(encKey[0]);

    await this.updateAllResetPasswordKeys(encKey[0], masterPasswordHash);
  }

  private async updateEmergencyAccesses(encKey: SymmetricCryptoKey) {
    const emergencyAccess = await this.apiService.getEmergencyAccessTrusted();
    const allowedStatuses = [
      EmergencyAccessStatusType.Confirmed,
      EmergencyAccessStatusType.RecoveryInitiated,
      EmergencyAccessStatusType.RecoveryApproved,
    ];

    const filteredAccesses = emergencyAccess.data.filter((d) => allowedStatuses.includes(d.status));

    for (const details of filteredAccesses) {
      const publicKeyResponse = await this.apiService.getUserPublicKey(details.granteeId);
      const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);

      const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);

      const updateRequest = new EmergencyAccessUpdateRequest();
      updateRequest.type = details.type;
      updateRequest.waitTimeDays = details.waitTimeDays;
      updateRequest.keyEncrypted = encryptedKey.encryptedString;

      await this.apiService.putEmergencyAccess(details.id, updateRequest);
    }
  }

  private async updateAllResetPasswordKeys(encKey: SymmetricCryptoKey, masterPasswordHash: string) {
    const orgs = await this.organizationService.getAll();

    for (const org of orgs) {
      // If not already enrolled, skip
      if (!org.resetPasswordEnrolled) {
        continue;
      }

      // Retrieve public key
      const response = await this.organizationApiService.getKeys(org.id);
      const publicKey = Utils.fromB64ToArray(response?.publicKey);

      // Re-enroll - encrpyt user's encKey.key with organization public key
      const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);

      // Create/Execute request
      const request = new OrganizationUserResetPasswordEnrollmentRequest();
      request.masterPasswordHash = masterPasswordHash;
      request.resetPasswordKey = encryptedKey.encryptedString;

      await this.organizationUserService.putOrganizationUserResetPasswordEnrollment(
        org.id,
        org.userId,
        request
      );
    }
  }
}
