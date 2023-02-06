import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { InternalAccountService } from "../../auth/abstractions/account.service";

export class AccountServiceImplementation implements InternalAccountService {
  constructor(private messagingService: MessagingService, private logService: LogService) {}

  async delete(): Promise<void> {
    try {
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
}
