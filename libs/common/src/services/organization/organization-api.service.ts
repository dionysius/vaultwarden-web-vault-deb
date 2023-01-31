import { ApiService } from "../../abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "../../abstractions/organization/organization-api.service.abstraction";
import { OrganizationApiKeyType } from "../../enums/organizationApiKeyType";
import { ImportDirectoryRequest } from "../../models/request/import-directory.request";
import { OrganizationApiKeyRequest } from "../../models/request/organization-api-key.request";
import { OrganizationCreateRequest } from "../../models/request/organization-create.request";
import { OrganizationKeysRequest } from "../../models/request/organization-keys.request";
import { OrganizationSubscriptionUpdateRequest } from "../../models/request/organization-subscription-update.request";
import { OrganizationTaxInfoUpdateRequest } from "../../models/request/organization-tax-info-update.request";
import { OrganizationUpdateRequest } from "../../models/request/organization-update.request";
import { OrganizationUpgradeRequest } from "../../models/request/organization-upgrade.request";
import { OrganizationSsoRequest } from "../../models/request/organization/organization-sso.request";
import { PaymentRequest } from "../../models/request/payment.request";
import { SeatRequest } from "../../models/request/seat.request";
import { SecretVerificationRequest } from "../../models/request/secret-verification.request";
import { StorageRequest } from "../../models/request/storage.request";
import { VerifyBankRequest } from "../../models/request/verify-bank.request";
import { ApiKeyResponse } from "../../models/response/api-key.response";
import { BillingResponse } from "../../models/response/billing.response";
import { ListResponse } from "../../models/response/list.response";
import { OrganizationApiKeyInformationResponse } from "../../models/response/organization-api-key-information.response";
import { OrganizationAutoEnrollStatusResponse } from "../../models/response/organization-auto-enroll-status.response";
import { OrganizationKeysResponse } from "../../models/response/organization-keys.response";
import { OrganizationSubscriptionResponse } from "../../models/response/organization-subscription.response";
import { OrganizationResponse } from "../../models/response/organization.response";
import { OrganizationSsoResponse } from "../../models/response/organization/organization-sso.response";
import { PaymentResponse } from "../../models/response/payment.response";
import { TaxInfoResponse } from "../../models/response/tax-info.response";
import { SyncService } from "../../vault/abstractions/sync/sync.service.abstraction";

export class OrganizationApiService implements OrganizationApiServiceAbstraction {
  constructor(private apiService: ApiService, private syncService: SyncService) {}

  async get(id: string): Promise<OrganizationResponse> {
    const r = await this.apiService.send("GET", "/organizations/" + id, null, true, true);
    return new OrganizationResponse(r);
  }

  async getBilling(id: string): Promise<BillingResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + id + "/billing",
      null,
      true,
      true
    );
    return new BillingResponse(r);
  }

  async getSubscription(id: string): Promise<OrganizationSubscriptionResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + id + "/subscription",
      null,
      true,
      true
    );
    return new OrganizationSubscriptionResponse(r);
  }

  async getLicense(id: string, installationId: string): Promise<unknown> {
    return this.apiService.send(
      "GET",
      "/organizations/" + id + "/license?installationId=" + installationId,
      null,
      true,
      true
    );
  }

  async getAutoEnrollStatus(identifier: string): Promise<OrganizationAutoEnrollStatusResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + identifier + "/auto-enroll-status",
      null,
      true,
      true
    );
    return new OrganizationAutoEnrollStatusResponse(r);
  }

  async create(request: OrganizationCreateRequest): Promise<OrganizationResponse> {
    const r = await this.apiService.send("POST", "/organizations", request, true, true);
    // Forcing a sync will notify organization service that they need to repull
    await this.syncService.fullSync(true);
    return new OrganizationResponse(r);
  }

  async createLicense(data: FormData): Promise<OrganizationResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/licenses/self-hosted",
      data,
      true,
      true
    );
    return new OrganizationResponse(r);
  }

  async save(id: string, request: OrganizationUpdateRequest): Promise<OrganizationResponse> {
    const r = await this.apiService.send("PUT", "/organizations/" + id, request, true, true);
    const data = new OrganizationResponse(r);
    await this.syncService.fullSync(true);
    return data;
  }

  async updatePayment(id: string, request: PaymentRequest): Promise<void> {
    return this.apiService.send("POST", "/organizations/" + id + "/payment", request, true, false);
  }

  async upgrade(id: string, request: OrganizationUpgradeRequest): Promise<PaymentResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/upgrade",
      request,
      true,
      true
    );
    return new PaymentResponse(r);
  }

  async updateSubscription(
    id: string,
    request: OrganizationSubscriptionUpdateRequest
  ): Promise<void> {
    return this.apiService.send(
      "POST",
      "/organizations/" + id + "/subscription",
      request,
      true,
      false
    );
  }

  async updateSeats(id: string, request: SeatRequest): Promise<PaymentResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/seat",
      request,
      true,
      true
    );
    return new PaymentResponse(r);
  }

  async updateStorage(id: string, request: StorageRequest): Promise<PaymentResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/storage",
      request,
      true,
      true
    );
    return new PaymentResponse(r);
  }

  async verifyBank(id: string, request: VerifyBankRequest): Promise<void> {
    await this.apiService.send(
      "POST",
      "/organizations/" + id + "/verify-bank",
      request,
      true,
      false
    );
  }

  async cancel(id: string): Promise<void> {
    return this.apiService.send("POST", "/organizations/" + id + "/cancel", null, true, false);
  }

  async reinstate(id: string): Promise<void> {
    return this.apiService.send("POST", "/organizations/" + id + "/reinstate", null, true, false);
  }

  async leave(id: string): Promise<void> {
    await this.apiService.send("POST", "/organizations/" + id + "/leave", null, true, false);
    await this.syncService.fullSync(true);
  }

  async delete(id: string, request: SecretVerificationRequest): Promise<void> {
    await this.apiService.send("DELETE", "/organizations/" + id, request, true, false);
    await this.syncService.fullSync(true);
  }

  async updateLicense(id: string, data: FormData): Promise<void> {
    await this.apiService.send(
      "POST",
      "/organizations/licenses/self-hosted/" + id,
      data,
      true,
      false
    );
  }

  async importDirectory(organizationId: string, request: ImportDirectoryRequest): Promise<void> {
    return this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/import",
      request,
      true,
      false
    );
  }

  async getOrCreateApiKey(id: string, request: OrganizationApiKeyRequest): Promise<ApiKeyResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/api-key",
      request,
      true,
      true
    );
    return new ApiKeyResponse(r);
  }

  async getApiKeyInformation(
    id: string,
    organizationApiKeyType: OrganizationApiKeyType = null
  ): Promise<ListResponse<OrganizationApiKeyInformationResponse>> {
    const uri =
      organizationApiKeyType === null
        ? "/organizations/" + id + "/api-key-information"
        : "/organizations/" + id + "/api-key-information/" + organizationApiKeyType;
    const r = await this.apiService.send("GET", uri, null, true, true);
    return new ListResponse(r, OrganizationApiKeyInformationResponse);
  }

  async rotateApiKey(id: string, request: OrganizationApiKeyRequest): Promise<ApiKeyResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/rotate-api-key",
      request,
      true,
      true
    );
    return new ApiKeyResponse(r);
  }

  async getTaxInfo(id: string): Promise<TaxInfoResponse> {
    const r = await this.apiService.send("GET", "/organizations/" + id + "/tax", null, true, true);
    return new TaxInfoResponse(r);
  }

  async updateTaxInfo(id: string, request: OrganizationTaxInfoUpdateRequest): Promise<void> {
    // Can't broadcast anything because the response doesn't have content
    return this.apiService.send("PUT", "/organizations/" + id + "/tax", request, true, false);
  }

  async getKeys(id: string): Promise<OrganizationKeysResponse> {
    const r = await this.apiService.send("GET", "/organizations/" + id + "/keys", null, true, true);
    return new OrganizationKeysResponse(r);
  }

  async updateKeys(
    id: string,
    request: OrganizationKeysRequest
  ): Promise<OrganizationKeysResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/keys",
      request,
      true,
      true
    );
    // Not broadcasting anything because data on this response doesn't correspond to `Organization`
    return new OrganizationKeysResponse(r);
  }

  async getSso(id: string): Promise<OrganizationSsoResponse> {
    const r = await this.apiService.send("GET", "/organizations/" + id + "/sso", null, true, true);
    return new OrganizationSsoResponse(r);
  }

  async updateSso(id: string, request: OrganizationSsoRequest): Promise<OrganizationSsoResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + id + "/sso",
      request,
      true,
      true
    );
    // Not broadcasting anything because data on this response doesn't correspond to `Organization`
    return new OrganizationSsoResponse(r);
  }

  async selfHostedSyncLicense(id: string) {
    await this.apiService.send(
      "POST",
      "/organizations/licenses/self-hosted/" + id + "/sync/",
      null,
      true,
      false
    );
  }
}
