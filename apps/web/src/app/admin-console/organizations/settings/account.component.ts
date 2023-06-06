import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { lastValueFrom } from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationKeysRequest } from "@bitwarden/common/admin-console/models/request/organization-keys.request";
import { OrganizationUpdateRequest } from "@bitwarden/common/admin-console/models/request/organization-update.request";
import { OrganizationResponse } from "@bitwarden/common/admin-console/models/response/organization.response";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { ApiKeyComponent } from "../../../settings/api-key.component";
import { PurgeVaultComponent } from "../../../settings/purge-vault.component";

import { DeleteOrganizationDialogResult, openDeleteOrganizationDialog } from "./components";

@Component({
  selector: "app-org-account",
  templateUrl: "account.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class AccountComponent {
  @ViewChild("purgeOrganizationTemplate", { read: ViewContainerRef, static: true })
  purgeModalRef: ViewContainerRef;
  @ViewChild("apiKeyTemplate", { read: ViewContainerRef, static: true })
  apiKeyModalRef: ViewContainerRef;
  @ViewChild("rotateApiKeyTemplate", { read: ViewContainerRef, static: true })
  rotateApiKeyModalRef: ViewContainerRef;

  selfHosted = false;
  canEditSubscription = true;
  loading = true;
  canUseApi = false;
  org: OrganizationResponse;
  formPromise: Promise<OrganizationResponse>;
  taxFormPromise: Promise<unknown>;

  private organizationId: string;

  constructor(
    private modalService: ModalService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private logService: LogService,
    private router: Router,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private dialogService: DialogServiceAbstraction
  ) {}

  async ngOnInit() {
    this.selfHosted = this.platformUtilsService.isSelfHost();

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.canEditSubscription = this.organizationService.get(
        this.organizationId
      ).canEditSubscription;
      try {
        this.org = await this.organizationApiService.get(this.organizationId);
        this.canUseApi = this.org.useApi;
      } catch (e) {
        this.logService.error(e);
      }
    });
    this.loading = false;
  }

  async submit() {
    try {
      const request = new OrganizationUpdateRequest();
      request.name = this.org.name;
      request.businessName = this.org.businessName;
      request.billingEmail = this.org.billingEmail;

      // Backfill pub/priv key if necessary
      if (!this.org.hasPublicAndPrivateKeys) {
        const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
        const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
        request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
      }

      this.formPromise = this.organizationApiService.save(this.organizationId, request);
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("organizationUpdated")
      );
    } catch (e) {
      this.logService.error(e);
    }
  }

  async deleteOrganization() {
    const dialog = openDeleteOrganizationDialog(this.dialogService, {
      data: {
        organizationId: this.organizationId,
        requestType: "RegularDelete",
      },
    });

    const result = await lastValueFrom(dialog.closed);

    if (result === DeleteOrganizationDialogResult.Deleted) {
      this.router.navigate(["/"]);
    }
  }

  async purgeVault() {
    await this.modalService.openViewRef(PurgeVaultComponent, this.purgeModalRef, (comp) => {
      comp.organizationId = this.organizationId;
    });
  }

  async viewApiKey() {
    await this.modalService.openViewRef(ApiKeyComponent, this.apiKeyModalRef, (comp) => {
      comp.keyType = "organization";
      comp.entityId = this.organizationId;
      comp.postKey = this.organizationApiService.getOrCreateApiKey.bind(
        this.organizationApiService
      );
      comp.scope = "api.organization";
      comp.grantType = "client_credentials";
      comp.apiKeyTitle = "apiKey";
      comp.apiKeyWarning = "apiKeyWarning";
      comp.apiKeyDescription = "apiKeyDesc";
    });
  }

  async rotateApiKey() {
    await this.modalService.openViewRef(ApiKeyComponent, this.rotateApiKeyModalRef, (comp) => {
      comp.keyType = "organization";
      comp.isRotation = true;
      comp.entityId = this.organizationId;
      comp.postKey = this.organizationApiService.rotateApiKey.bind(this.organizationApiService);
      comp.scope = "api.organization";
      comp.grantType = "client_credentials";
      comp.apiKeyTitle = "apiKey";
      comp.apiKeyWarning = "apiKeyWarning";
      comp.apiKeyDescription = "apiKeyRotateDesc";
    });
  }
}
