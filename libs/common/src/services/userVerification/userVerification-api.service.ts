import { ApiService } from "../../abstractions/api.service";
import { UserVerificationApiServiceAbstraction } from "../../abstractions/userVerification/userVerification-api.service.abstraction";
import { VerifyOTPRequest } from "../../models/request/account/verify-otp.request";

export class UserVerificationApiService implements UserVerificationApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  postAccountVerifyOTP(request: VerifyOTPRequest): Promise<void> {
    return this.apiService.send("POST", "/accounts/verify-otp", request, true, false);
  }
  async postAccountRequestOTP(): Promise<void> {
    return this.apiService.send("POST", "/accounts/request-otp", null, true, false);
  }
}
