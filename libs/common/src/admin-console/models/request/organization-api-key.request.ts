import { SecretVerificationRequest } from "../../../auth/models/request/secret-verification.request";
import { OrganizationApiKeyType } from "../../enums/organization-api-key-type";

export class OrganizationApiKeyRequest extends SecretVerificationRequest {
  type: OrganizationApiKeyType = OrganizationApiKeyType.Default;
}
