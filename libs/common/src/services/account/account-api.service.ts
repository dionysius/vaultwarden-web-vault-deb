import { AccountApiService as AccountApiServiceAbstraction } from "../../abstractions/account/account-api.service.abstraction";
import { ApiService } from "../../abstractions/api.service";
import { SecretVerificationRequest } from "../../models/request/secretVerificationRequest";

export class AccountApiService implements AccountApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  deleteAccount(request: SecretVerificationRequest): Promise<void> {
    return this.apiService.send("DELETE", "/accounts", request, true, false);
  }
}
