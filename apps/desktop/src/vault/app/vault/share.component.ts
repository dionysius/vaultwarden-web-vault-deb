import { Component } from "@angular/core";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ShareComponent as BaseShareComponent } from "@bitwarden/angular/components/share.component";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

@Component({
  selector: "app-vault-share",
  templateUrl: "share.component.html",
})
export class ShareComponent extends BaseShareComponent {
  constructor(
    cipherService: CipherService,
    i18nService: I18nService,
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    organizationService: OrganizationService,
    private modalRef: ModalRef
  ) {
    super(
      collectionService,
      platformUtilsService,
      i18nService,
      cipherService,
      logService,
      organizationService
    );
  }

  protected close() {
    this.modalRef.close();
  }
}
