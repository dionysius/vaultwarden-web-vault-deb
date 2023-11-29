import { Component } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { CipherData } from "@bitwarden/common/vault/models/data/cipher.data";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherCollectionsRequest } from "@bitwarden/common/vault/models/request/cipher-collections.request";

import { CollectionsComponent as BaseCollectionsComponent } from "../individual-vault/collections.component";

@Component({
  selector: "app-org-vault-collections",
  templateUrl: "../../vault/individual-vault/collections.component.html",
})
export class CollectionsComponent extends BaseCollectionsComponent {
  organization: Organization;

  constructor(
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    cipherService: CipherService,
    private apiService: ApiService,
    logService: LogService,
  ) {
    super(collectionService, platformUtilsService, i18nService, cipherService, logService);
    this.allowSelectNone = true;
  }

  protected async loadCipher() {
    if (!this.organization.canViewAllCollections) {
      return await super.loadCipher();
    }
    const response = await this.apiService.getCipherAdmin(this.cipherId);
    return new Cipher(new CipherData(response));
  }

  protected loadCipherCollections() {
    if (!this.organization.canViewAllCollections) {
      return super.loadCipherCollections();
    }
    return this.collectionIds;
  }

  protected loadCollections() {
    if (!this.organization.canViewAllCollections) {
      return super.loadCollections();
    }
    return Promise.resolve(this.collections);
  }

  protected saveCollections() {
    if (this.organization.canEditAnyCollection) {
      const request = new CipherCollectionsRequest(this.cipherDomain.collectionIds);
      return this.apiService.putCipherCollectionsAdmin(this.cipherId, request);
    } else {
      return super.saveCollections();
    }
  }
}
