import { AccountApiService } from "../../abstractions/account/account-api.service";
import { InternalAccountService } from "../../abstractions/account/account.service";
import { ApiService } from "../../abstractions/api.service";
import { LogService } from "../../abstractions/log.service";
import { UserVerificationService } from "../../abstractions/userVerification/userVerification.service.abstraction";
import { Verification } from "../../types/verification";

export class AccountApiServiceImplementation implements AccountApiService {
  constructor(
    private apiService: ApiService,
    private userVerificationService: UserVerificationService,
    private logService: LogService,
    private accountService: InternalAccountService
  ) {}

  async deleteAccount(verification: Verification): Promise<void> {
    try {
      const verificationRequest = await this.userVerificationService.buildRequest(verification);
      await this.apiService.send("DELETE", "/accounts", verificationRequest, true, false);
      this.accountService.delete();
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
}
