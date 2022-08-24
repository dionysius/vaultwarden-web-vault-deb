import { ApiService } from "../../abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "../../abstractions/organization/organization-api.service.abstraction";
import { OrganizationApiKeyType } from "../../enums/organizationApiKeyType";
import { ImportDirectoryRequest } from "../../models/request/importDirectoryRequest";
import { OrganizationSsoRequest } from "../../models/request/organization/organizationSsoRequest";
import { OrganizationApiKeyRequest } from "../../models/request/organizationApiKeyRequest";
import { OrganizationCreateRequest } from "../../models/request/organizationCreateRequest";
import { OrganizationKeysRequest } from "../../models/request/organizationKeysRequest";
import { OrganizationSubscriptionUpdateRequest } from "../../models/request/organizationSubscriptionUpdateRequest";
import { OrganizationTaxInfoUpdateRequest } from "../../models/request/organizationTaxInfoUpdateRequest";
import { OrganizationUpdateRequest } from "../../models/request/organizationUpdateRequest";
import { OrganizationUpgradeRequest } from "../../models/request/organizationUpgradeRequest";
import { PaymentRequest } from "../../models/request/paymentRequest";
import { SeatRequest } from "../../models/request/seatRequest";
import { SecretVerificationRequest } from "../../models/request/secretVerificationRequest";
import { StorageRequest } from "../../models/request/storageRequest";
import { VerifyBankRequest } from "../../models/request/verifyBankRequest";
import { ApiKeyResponse } from "../../models/response/apiKeyResponse";
import { BillingResponse } from "../../models/response/billingResponse";
import { ListResponse } from "../../models/response/listResponse";
import { OrganizationSsoResponse } from "../../models/response/organization/organizationSsoResponse";
import { OrganizationApiKeyInformationResponse } from "../../models/response/organizationApiKeyInformationResponse";
import { OrganizationAutoEnrollStatusResponse } from "../../models/response/organizationAutoEnrollStatusResponse";
import { OrganizationKeysResponse } from "../../models/response/organizationKeysResponse";
import { OrganizationResponse } from "../../models/response/organizationResponse";
import { OrganizationSubscriptionResponse } from "../../models/response/organizationSubscriptionResponse";
import { PaymentResponse } from "../../models/response/paymentResponse";
import { TaxInfoResponse } from "../../models/response/taxInfoResponse";

export class OrganizationApiService implements OrganizationApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

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
    return new OrganizationResponse(r);
  }

  async createLicense(data: FormData): Promise<OrganizationResponse> {
    const r = await this.apiService.send("POST", "/organizations/license", data, true, true);
    return new OrganizationResponse(r);
  }

  async save(id: string, request: OrganizationUpdateRequest): Promise<OrganizationResponse> {
    const r = await this.apiService.send("PUT", "/organizations/" + id, request, true, true);
    return new OrganizationResponse(r);
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
    return this.apiService.send(
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
    return this.apiService.send("POST", "/organizations/" + id + "/leave", null, true, false);
  }

  async delete(id: string, request: SecretVerificationRequest): Promise<void> {
    return this.apiService.send("DELETE", "/organizations/" + id, request, true, false);
  }

  async updateLicense(id: string, data: FormData): Promise<void> {
    return this.apiService.send("POST", "/organizations/" + id + "/license", data, true, false);
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
    return new OrganizationSsoResponse(r);
  }
}
