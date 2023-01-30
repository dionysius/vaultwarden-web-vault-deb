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
  selfHostedSyncLicense: (id: string) => Promise<void>;
}
