import { BaseResponse } from "./base.response";
import { ProfileResponse } from "./profile.response";

export class PaymentResponse extends BaseResponse {
  userProfile: ProfileResponse;
  paymentIntentClientSecret: string;
  success: boolean;

  constructor(response: any) {
    super(response);
    const userProfile = this.getResponseProperty("UserProfile");
    if (userProfile != null) {
      this.userProfile = new ProfileResponse(userProfile);
    }
    this.paymentIntentClientSecret = this.getResponseProperty("PaymentIntentClientSecret");
    this.success = this.getResponseProperty("Success");
  }
}
