import { VerifyOTPRequest } from "../../models/request/account/verify-otp.request";

export abstract class UserVerificationApiServiceAbstraction {
  postAccountVerifyOTP: (request: VerifyOTPRequest) => Promise<void>;
  postAccountRequestOTP: () => Promise<void>;
}
