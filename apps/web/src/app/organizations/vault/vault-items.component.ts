import { Component, EventEmitter, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordRepromptService } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { CipherView } from "@bitwarden/common/models/view/cipher.view";

import { VaultItemsComponent as BaseVaultItemsComponent } from "../../vault/vault-items.component";

@Component({
  selector: "app-org-vault-items",
  templateUrl: "../../vault/vault-items.component.html",
})
export class VaultItemsComponent extends BaseVaultItemsComponent {
  @Output() onEventsClicked = new EventEmitter<CipherView>();

  protected allCiphers: CipherView[] = [];

  constructor(
    searchService: SearchService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    cipherService: CipherService,
    eventCollectionService: EventCollectionService,
    totpService: TotpService,
    passwordRepromptService: PasswordRepromptService,
    logService: LogService,
    stateService: StateService,
    organizationService: OrganizationService,
    tokenService: TokenService,
    private apiService: ApiService
  ) {
    super(
      searchService,
      i18nService,
      platformUtilsService,
      cipherService,
      eventCollectionService,
      totpService,
      stateService,
      passwordRepromptService,
      logService,
      organizationService,
      tokenService
    );
  }

  async load(filter: (cipher: CipherView) => boolean = null, deleted = false) {
    this.deleted = deleted || false;
    if (this.organization.canEditAnyCollection) {
      this.accessEvents = this.organization.useEvents;
      this.allCiphers = await this.cipherService.getAllFromApiForOrganization(this.organization.id);
    } else {
      this.allCiphers = (await this.cipherService.getAllDecrypted()).filter(
        (c) => c.organizationId === this.organization.id
      );
    }
    await this.searchService.indexCiphers(this.organization.id, this.allCiphers);
    await this.applyFilter(filter);
    this.loaded = true;
  }

  async applyFilter(filter: (cipher: CipherView) => boolean = null) {
    if (this.organization.canViewAllCollections) {
      await super.applyFilter(filter);
    } else {
      const f = (c: CipherView) =>
        c.organizationId === this.organization.id && (filter == null || filter(c));
      await super.applyFilter(f);
    }
  }

  async search(timeout: number = null) {
    await super.search(timeout, this.allCiphers);
  }

  events(c: CipherView) {
    this.onEventsClicked.emit(c);
  }

  protected deleteCipher(id: string) {
    if (!this.organization.canEditAnyCollection) {
      return super.deleteCipher(id, this.deleted);
    }
    return this.deleted
      ? this.apiService.deleteCipherAdmin(id)
      : this.apiService.putDeleteCipherAdmin(id);
  }

  protected showFixOldAttachments(c: CipherView) {
    return this.organization.canEditAnyCollection && c.hasOldAttachments;
  }
}
