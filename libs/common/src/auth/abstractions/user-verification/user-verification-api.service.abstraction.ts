import { VerifyOTPRequest } from "../../models/request/verify-otp.request";

export abstract class UserVerificationApiServiceAbstraction {
  postAccountVerifyOTP: (request: VerifyOTPRequest) => Promise<void>;
  postAccountRequestOTP: () => Promise<void>;
}
