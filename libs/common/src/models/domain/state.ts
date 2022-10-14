import { Jsonify } from "type-fest";

import { Account } from "./account";
import { GlobalState } from "./global-state";

export class State<
  TGlobalState extends GlobalState = GlobalState,
  TAccount extends Account = Account
> {
  accounts: { [userId: string]: TAccount } = {};
  globals: TGlobalState;
  activeUserId: string;
  authenticatedAccounts: string[] = [];
  accountActivity: { [userId: string]: number } = {};

  constructor(globals: TGlobalState) {
    this.globals = globals;
  }

  // TODO, make Jsonify<State,TGlobalState,TAccount> work. It currently doesn't because Globals doesn't implement Jsonify.
  static fromJSON<TGlobalState extends GlobalState, TAccount extends Account>(
    obj: any
  ): State<TGlobalState, TAccount> {
    if (obj == null) {
      return null;
    }

    return Object.assign(new State(null), obj, {
      accounts: State.buildAccountMapFromJSON(obj?.accounts),
    });
  }

  private static buildAccountMapFromJSON(
    jsonAccounts: Jsonify<{ [userId: string]: Jsonify<Account> }>
  ) {
    if (!jsonAccounts) {
      return {};
    }
    const accounts: { [userId: string]: Account } = {};
    for (const userId in jsonAccounts) {
      accounts[userId] = Account.fromJSON(jsonAccounts[userId]);
    }
    return accounts;
  }
}
