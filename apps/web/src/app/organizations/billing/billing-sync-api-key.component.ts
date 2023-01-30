import { Component } from "@angular/core";

import { ModalConfig } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { OrganizationApiKeyType } from "@bitwarden/common/enums/organizationApiKeyType";
import { OrganizationApiKeyRequest } from "@bitwarden/common/models/request/organization-api-key.request";
import { ApiKeyResponse } from "@bitwarden/common/models/response/api-key.response";
import { Verification } from "@bitwarden/common/types/verification";

export interface BillingSyncApiModalData {
  organizationId: string;
  hasBillingToken: boolean;
}

@Component({
  selector: "app-billing-sync-api-key",
  templateUrl: "billing-sync-api-key.component.html",
})
export class BillingSyncApiKeyComponent {
  organizationId: string;
  hasBillingToken: boolean;

  showRotateScreen: boolean;
  masterPassword: Verification;
  formPromise: Promise<ApiKeyResponse>;
  clientSecret?: string;
  keyRevisionDate?: Date;
  lastSyncDate?: Date = null;

  constructor(
    private userVerificationService: UserVerificationService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    modalConfig: ModalConfig<BillingSyncApiModalData>
  ) {
    this.organizationId = modalConfig.data.organizationId;
    this.hasBillingToken = modalConfig.data.hasBillingToken;
  }

  copy() {
    this.platformUtilsService.copyToClipboard(this.clientSecret);
  }

  async submit() {
    if (this.showRotateScreen) {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword, OrganizationApiKeyRequest)
        .then((request) => {
          request.type = OrganizationApiKeyType.BillingSync;
          return this.organizationApiService.rotateApiKey(this.organizationId, request);
        });
      const response = await this.formPromise;
      await this.load(response);
      this.showRotateScreen = false;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("billingSyncApiKeyRotated")
      );
    } else {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword, OrganizationApiKeyRequest)
        .then((request) => {
          request.type = OrganizationApiKeyType.BillingSync;
          return this.organizationApiService.getOrCreateApiKey(this.organizationId, request);
        });
      const response = await this.formPromise;
      await this.load(response);
    }
  }

  async load(response: ApiKeyResponse) {
    this.clientSecret = response.apiKey;
    this.keyRevisionDate = response.revisionDate;
    this.hasBillingToken = true;
    const syncStatus = await this.apiService.getSponsorshipSyncStatus(this.organizationId);
    this.lastSyncDate = syncStatus.lastSyncDate;
  }

  cancelRotate() {
    this.showRotateScreen = false;
  }

  rotateToken() {
    this.showRotateScreen = true;
  }

  private dayDiff(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  get submitButtonText(): string {
    if (this.showRotateScreen) {
      return this.i18nService.t("rotateToken");
    }

    return this.i18nService.t(this.hasBillingToken ? "continue" : "generateToken");
  }

  get showLastSyncText(): boolean {
    // If the keyRevisionDate is later than the lastSyncDate we need to show
    // a warning that they need to put the billing sync key in their self hosted install
    return this.lastSyncDate && this.lastSyncDate > this.keyRevisionDate;
  }

  get showAwaitingSyncText(): boolean {
    return this.lastSyncDate && this.lastSyncDate <= this.keyRevisionDate;
  }

  get daysBetween(): number {
    return this.dayDiff(this.keyRevisionDate, new Date());
  }
}
