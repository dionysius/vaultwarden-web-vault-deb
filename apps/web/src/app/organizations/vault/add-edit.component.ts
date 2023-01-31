import { Component } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { CipherData } from "@bitwarden/common/vault/models/data/cipher.data";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherCreateRequest } from "@bitwarden/common/vault/models/request/cipher-create.request";
import { CipherRequest } from "@bitwarden/common/vault/models/request/cipher.request";

import { AddEditComponent as BaseAddEditComponent } from "../../../vault/app/vault/add-edit.component";

@Component({
  selector: "app-org-vault-add-edit",
  templateUrl: "../../../vault/app/vault/add-edit.component.html",
})
export class AddEditComponent extends BaseAddEditComponent {
  originalCipher: Cipher = null;
  protected override componentName = "app-org-vault-add-edit";

  constructor(
    cipherService: CipherService,
    folderService: FolderService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    auditService: AuditService,
    stateService: StateService,
    collectionService: CollectionService,
    totpService: TotpService,
    passwordGenerationService: PasswordGenerationService,
    private apiService: ApiService,
    messagingService: MessagingService,
    eventCollectionService: EventCollectionService,
    policyService: PolicyService,
    logService: LogService,
    passwordRepromptService: PasswordRepromptService,
    organizationService: OrganizationService
  ) {
    super(
      cipherService,
      folderService,
      i18nService,
      platformUtilsService,
      auditService,
      stateService,
      collectionService,
      totpService,
      passwordGenerationService,
      messagingService,
      eventCollectionService,
      policyService,
      organizationService,
      logService,
      passwordRepromptService
    );
  }

  protected allowOwnershipAssignment() {
    if (
      this.ownershipOptions != null &&
      (this.ownershipOptions.length > 1 || !this.allowPersonal)
    ) {
      if (this.organization != null) {
        return this.cloneMode && this.organization.canEditAnyCollection;
      } else {
        return !this.editMode || this.cloneMode;
      }
    }
    return false;
  }

  protected loadCollections() {
    if (!this.organization.canEditAnyCollection) {
      return super.loadCollections();
    }
    return Promise.resolve(this.collections);
  }

  protected async loadCipher() {
    if (!this.organization.canEditAnyCollection) {
      return await super.loadCipher();
    }
    const response = await this.apiService.getCipherAdmin(this.cipherId);
    const data = new CipherData(response);

    data.edit = true;
    const cipher = new Cipher(data);
    this.originalCipher = cipher;
    return cipher;
  }

  protected encryptCipher() {
    if (!this.organization.canEditAnyCollection) {
      return super.encryptCipher();
    }
    return this.cipherService.encrypt(this.cipher, null, this.originalCipher);
  }

  protected async saveCipher(cipher: Cipher) {
    if (!this.organization.canEditAnyCollection || cipher.organizationId == null) {
      return super.saveCipher(cipher);
    }
    if (this.editMode && !this.cloneMode) {
      const request = new CipherRequest(cipher);
      return this.apiService.putCipherAdmin(this.cipherId, request);
    } else {
      const request = new CipherCreateRequest(cipher);
      return this.apiService.postCipherAdmin(request);
    }
  }

  protected async deleteCipher() {
    if (!this.organization.canEditAnyCollection) {
      return super.deleteCipher();
    }
    return this.cipher.isDeleted
      ? this.apiService.deleteCipherAdmin(this.cipherId)
      : this.apiService.putDeleteCipherAdmin(this.cipherId);
  }
}
