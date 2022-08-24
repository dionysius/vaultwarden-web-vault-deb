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

export class OrganizationApiServiceAbstraction {
  get: (id: string) => Promise<OrganizationResponse>;
  getBilling: (id: string) => Promise<BillingResponse>;
  getSubscription: (id: string) => Promise<OrganizationSubscriptionResponse>;
  getLicense: (id: string, installationId: string) => Promise<unknown>;
  getAutoEnrollStatus: (identifier: string) => Promise<OrganizationAutoEnrollStatusResponse>;
  create: (request: OrganizationCreateRequest) => Promise<OrganizationResponse>;
  createLicense: (data: FormData) => Promise<OrganizationResponse>;
  save: (id: string, request: OrganizationUpdateRequest) => Promise<OrganizationResponse>;
  updatePayment: (id: string, request: PaymentRequest) => Promise<void>;
  upgrade: (id: string, request: OrganizationUpgradeRequest) => Promise<PaymentResponse>;
  updateSubscription: (id: string, request: OrganizationSubscriptionUpdateRequest) => Promise<void>;
  updateSeats: (id: string, request: SeatRequest) => Promise<PaymentResponse>;
  updateStorage: (id: string, request: StorageRequest) => Promise<PaymentResponse>;
  verifyBank: (id: string, request: VerifyBankRequest) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  reinstate: (id: string) => Promise<void>;
  leave: (id: string) => Promise<void>;
  delete: (id: string, request: SecretVerificationRequest) => Promise<void>;
  updateLicense: (id: string, data: FormData) => Promise<void>;
  importDirectory: (organizationId: string, request: ImportDirectoryRequest) => Promise<void>;
  getOrCreateApiKey: (id: string, request: OrganizationApiKeyRequest) => Promise<ApiKeyResponse>;
  getApiKeyInformation: (
    id: string,
    organizationApiKeyType?: OrganizationApiKeyType
  ) => Promise<ListResponse<OrganizationApiKeyInformationResponse>>;
  rotateApiKey: (id: string, request: OrganizationApiKeyRequest) => Promise<ApiKeyResponse>;
  getTaxInfo: (id: string) => Promise<TaxInfoResponse>;
  updateTaxInfo: (id: string, request: OrganizationTaxInfoUpdateRequest) => Promise<void>;
  getKeys: (id: string) => Promise<OrganizationKeysResponse>;
  updateKeys: (id: string, request: OrganizationKeysRequest) => Promise<OrganizationKeysResponse>;
  getSso: (id: string) => Promise<OrganizationSsoResponse>;
  updateSso: (id: string, request: OrganizationSsoRequest) => Promise<OrganizationSsoResponse>;
}
