import { Component } from "@angular/core";

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
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";

import { AddEditComponent as BaseAddEditComponent } from "../../vault/app/vault/add-edit.component";

@Component({
  selector: "app-org-vault-add-edit",
  templateUrl: "../../vault/app/vault/add-edit.component.html",
})
export class EmergencyAddEditComponent extends BaseAddEditComponent {
  originalCipher: Cipher = null;
  viewOnly = true;
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
    messagingService: MessagingService,
    eventCollectionService: EventCollectionService,
    policyService: PolicyService,
    passwordRepromptService: PasswordRepromptService,
    organizationService: OrganizationService,
    logService: LogService
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

  async load() {
    this.title = this.i18nService.t("viewItem");
  }

  protected async loadCipher() {
    return Promise.resolve(this.originalCipher);
  }
}
