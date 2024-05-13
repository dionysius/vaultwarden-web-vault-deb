import { Account as BaseAccount } from "@bitwarden/common/platform/models/domain/account";

// TODO: platform to clean up accounts in later PR
export class Account extends BaseAccount {
  constructor(init: Partial<Account>) {
    super(init);
  }
}
