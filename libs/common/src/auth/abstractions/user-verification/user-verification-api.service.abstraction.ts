import { SecretVerificationRequest } from "../../models/request/secret-verification.request";
import { VerifyOTPRequest } from "../../models/request/verify-otp.request";
import { MasterPasswordPolicyResponse } from "../../models/response/master-password-policy.response";

export abstract class UserVerificationApiServiceAbstraction {
  postAccountVerifyOTP: (request: VerifyOTPRequest) => Promise<void>;
  postAccountRequestOTP: () => Promise<void>;
  postAccountVerifyPassword: (
    request: SecretVerificationRequest,
  ) => Promise<MasterPasswordPolicyResponse>;
}
