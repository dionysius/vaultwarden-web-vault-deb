import { VerifyOTPRequest } from "@bitwarden/common/models/request/account/verifyOTPRequest";

export abstract class UserVerificationApiServiceAbstraction {
  postAccountVerifyOTP: (request: VerifyOTPRequest) => Promise<void>;
  postAccountRequestOTP: () => Promise<void>;
}
