import { Component, EventEmitter, OnInit, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { Utils } from "@bitwarden/common/misc/utils";
import { Verification } from "@bitwarden/common/types/verification";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

class CountBasedLocalizationKey {
  singular: string;
  plural: string;

  getKey(count: number) {
    return count == 1 ? this.singular : this.plural;
  }

  constructor(singular: string, plural: string) {
    this.singular = singular;
    this.plural = plural;
  }
}

class OrganizationContentSummaryItem {
  count: number;
  get localizationKey(): string {
    return this.localizationKeyOptions.getKey(this.count);
  }
  private localizationKeyOptions: CountBasedLocalizationKey;
  constructor(count: number, localizationKeyOptions: CountBasedLocalizationKey) {
    this.count = count;
    this.localizationKeyOptions = localizationKeyOptions;
  }
}

class OrganizationContentSummary {
  totalItemCount = 0;
  itemCountByType: OrganizationContentSummaryItem[] = [];
}

@Component({
  selector: "app-delete-organization",
  templateUrl: "delete-organization.component.html",
})
export class DeleteOrganizationComponent implements OnInit {
  organizationId: string;
  loaded: boolean;
  deleteOrganizationRequestType: "InvalidFamiliesForEnterprise" | "RegularDelete" = "RegularDelete";
  organizationName: string;
  organizationContentSummary: OrganizationContentSummary = new OrganizationContentSummary();
  @Output() onSuccess: EventEmitter<void> = new EventEmitter();

  masterPassword: Verification;
  formPromise: Promise<void>;

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private logService: LogService,
    private cipherService: CipherService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.organizationApiService.delete(this.organizationId, request));
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("organizationDeleted"),
        this.i18nService.t("organizationDeletedDesc")
      );
      this.onSuccess.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async load() {
    this.organizationName = (await this.organizationService.get(this.organizationId)).name;
    this.organizationContentSummary = await this.buildOrganizationContentSummary();
    this.loaded = true;
  }

  private async buildOrganizationContentSummary(): Promise<OrganizationContentSummary> {
    const organizationContentSummary = new OrganizationContentSummary();
    const organizationItems = (
      await this.cipherService.getAllFromApiForOrganization(this.organizationId)
    ).filter((item) => item.deletedDate == null);

    if (organizationItems.length < 1) {
      return organizationContentSummary;
    }

    organizationContentSummary.totalItemCount = organizationItems.length;
    for (const cipherType of Utils.iterateEnum(CipherType)) {
      const count = this.getOrganizationItemCountByType(organizationItems, cipherType);
      if (count > 0) {
        organizationContentSummary.itemCountByType.push(
          new OrganizationContentSummaryItem(
            count,
            this.getOrganizationItemLocalizationKeysByType(CipherType[cipherType])
          )
        );
      }
    }

    return organizationContentSummary;
  }

  private getOrganizationItemCountByType(items: CipherView[], type: CipherType) {
    return items.filter((item) => item.type == type).length;
  }

  private getOrganizationItemLocalizationKeysByType(type: string): CountBasedLocalizationKey {
    return new CountBasedLocalizationKey(`type${type}`, `type${type}Plural`);
  }
}
