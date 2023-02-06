import { OrganizationApiKeyType } from "../../auth/enums/organization-api-key-type";
import { SecretVerificationRequest } from "../../auth/models/request/secret-verification.request";

export class OrganizationApiKeyRequest extends SecretVerificationRequest {
  type: OrganizationApiKeyType = OrganizationApiKeyType.Default;
}
