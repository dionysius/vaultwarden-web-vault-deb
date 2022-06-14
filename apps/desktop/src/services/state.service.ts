import { StateService as StateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";
import { StateService as BaseStateService } from "@bitwarden/common/services/state.service";

import { Account } from "../models/account";

export class StateService
  extends BaseStateService<GlobalState, Account>
  implements StateServiceAbstraction
{
  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }
}
