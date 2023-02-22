import { Component, OnDestroy } from "@angular/core";

import { ShareComponent as BaseShareComponent } from "@bitwarden/angular/components/share.component";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

@Component({
  selector: "app-vault-share",
  templateUrl: "share.component.html",
})
export class ShareComponent extends BaseShareComponent implements OnDestroy {
  constructor(
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    cipherService: CipherService,
    organizationService: OrganizationService,
    logService: LogService
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

  ngOnDestroy() {
    this.selectAll(false);
  }

  check(c: CollectionView, select?: boolean) {
    (c as any).checked = select == null ? !(c as any).checked : select;
  }

  selectAll(select: boolean) {
    const collections = select ? this.collections : this.writeableCollections;
    collections.forEach((c) => this.check(c, select));
  }
}
