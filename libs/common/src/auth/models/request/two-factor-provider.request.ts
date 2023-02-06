import { TwoFactorProviderType } from "../../enums/two-factor-provider-type";

import { SecretVerificationRequest } from "./secret-verification.request";

export class TwoFactorProviderRequest extends SecretVerificationRequest {
  type: TwoFactorProviderType;
}
