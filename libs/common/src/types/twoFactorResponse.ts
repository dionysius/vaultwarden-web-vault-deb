import { TwoFactorAuthenticatorResponse } from "../models/response/twoFactorAuthenticatorResponse";
import { TwoFactorDuoResponse } from "../models/response/twoFactorDuoResponse";
import { TwoFactorEmailResponse } from "../models/response/twoFactorEmailResponse";
import { TwoFactorRecoverResponse } from "../models/response/twoFactorRescoverResponse";
import { TwoFactorWebAuthnResponse } from "../models/response/twoFactorWebAuthnResponse";
import { TwoFactorYubiKeyResponse } from "../models/response/twoFactorYubiKeyResponse";

export type TwoFactorResponse =
  | TwoFactorRecoverResponse
  | TwoFactorDuoResponse
  | TwoFactorEmailResponse
  | TwoFactorWebAuthnResponse
  | TwoFactorAuthenticatorResponse
  | TwoFactorYubiKeyResponse;
