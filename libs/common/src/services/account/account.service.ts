import { AccountApiService } from "../../abstractions/account/account-api.service.abstraction";
import { AccountService as AccountServiceAbstraction } from "../../abstractions/account/account.service.abstraction";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { UserVerificationService } from "../../abstractions/userVerification/userVerification.service.abstraction";
import { Verification } from "../../types/verification";

export class AccountService implements AccountServiceAbstraction {
  constructor(
    private accountApiService: AccountApiService,
    private userVerificationService: UserVerificationService,
    private messagingService: MessagingService,
    private logService: LogService
  ) {}

  async delete(verification: Verification): Promise<void> {
    try {
      const verificationRequest = await this.userVerificationService.buildRequest(verification);
      await this.accountApiService.deleteAccount(verificationRequest);
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
}
