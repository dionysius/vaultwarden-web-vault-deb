import { OrganizationApiKeyType } from "../../enums/organizationApiKeyType";

import { SecretVerificationRequest } from "./secret-verification.request";

export class OrganizationApiKeyRequest extends SecretVerificationRequest {
  type: OrganizationApiKeyType = OrganizationApiKeyType.Default;
}
