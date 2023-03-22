import { OrganizationApiKeyType } from "../../admin-console/enums/organization-api-key-type";
import { SecretVerificationRequest } from "../../auth/models/request/secret-verification.request";

export class OrganizationApiKeyRequest extends SecretVerificationRequest {
  type: OrganizationApiKeyType = OrganizationApiKeyType.Default;
}
