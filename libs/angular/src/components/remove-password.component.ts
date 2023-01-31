import { Directive, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

@Directive()
export class RemovePasswordComponent implements OnInit {
  actionPromise: Promise<void | boolean>;
  continuing = false;
  leaving = false;

  loading = true;
  organization: Organization;
  email: string;

  constructor(
    private router: Router,
    private stateService: StateService,
    private syncService: SyncService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private keyConnectorService: KeyConnectorService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit() {
    this.organization = await this.keyConnectorService.getManagingOrganization();
    this.email = await this.stateService.getEmail();
    await this.syncService.fullSync(false);
    this.loading = false;
  }

  async convert() {
    this.continuing = true;
    this.actionPromise = this.keyConnectorService.migrateUser();

    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removedMasterPassword")
      );
      await this.keyConnectorService.removeConvertAccountRequired();
      this.router.navigate([""]);
    } catch (e) {
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), e.message);
    }
  }

  async leave() {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("leaveOrganizationConfirmation"),
      this.organization.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.leaving = true;
      this.actionPromise = this.organizationApiService.leave(this.organization.id);
      await this.actionPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("leftOrganization"));
      await this.keyConnectorService.removeConvertAccountRequired();
      this.router.navigate([""]);
    } catch (e) {
      this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), e);
    }
  }
}
