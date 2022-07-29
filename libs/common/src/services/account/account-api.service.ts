import { AccountApiService as AccountApiServiceAbstraction } from "@bitwarden/common/abstractions/account/account-api.service.abstraction";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SecretVerificationRequest } from "@bitwarden/common/models/request/secretVerificationRequest";

export class AccountApiService implements AccountApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  deleteAccount(request: SecretVerificationRequest): Promise<void> {
    return this.apiService.send("DELETE", "/accounts", request, true, false);
  }
}
