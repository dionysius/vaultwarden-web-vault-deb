import { TwoFactorProviderType } from "../../enums/twoFactorProviderType";

import { SecretVerificationRequest } from "./secret-verification.request";

export class TwoFactorProviderRequest extends SecretVerificationRequest {
  type: TwoFactorProviderType;
}
