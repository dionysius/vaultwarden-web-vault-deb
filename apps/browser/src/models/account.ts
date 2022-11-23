import { Jsonify } from "type-fest";

import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
} from "@bitwarden/common/models/domain/account";

import { BrowserComponentState } from "./browserComponentState";
import { BrowserGroupingsComponentState } from "./browserGroupingsComponentState";
import { BrowserSendComponentState } from "./browserSendComponentState";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout = -1; // On Restart

  static fromJSON(json: Jsonify<AccountSettings>): AccountSettings {
    if (json == null) {
      return null;
    }

    return Object.assign(new AccountSettings(), json, super.fromJSON(json));
  }
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();
  groupings?: BrowserGroupingsComponentState;
  send?: BrowserSendComponentState;
  ciphers?: BrowserComponentState;
  sendType?: BrowserComponentState;

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
    this.groupings = init?.groupings ?? new BrowserGroupingsComponentState();
    this.send = init?.send ?? new BrowserSendComponentState();
    this.ciphers = init?.ciphers ?? new BrowserComponentState();
    this.sendType = init?.sendType ?? new BrowserComponentState();
  }

  static fromJSON(json: Jsonify<Account>): Account {
    if (json == null) {
      return null;
    }

    return Object.assign(new Account({}), json, super.fromJSON(json), {
      settings: AccountSettings.fromJSON(json.settings),
      groupings: BrowserGroupingsComponentState.fromJSON(json.groupings),
      send: BrowserSendComponentState.fromJSON(json.send),
      ciphers: BrowserComponentState.fromJSON(json.ciphers),
      sendType: BrowserComponentState.fromJSON(json.sendType),
    });
  }
}
