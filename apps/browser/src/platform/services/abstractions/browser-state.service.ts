import { StateService as BaseStateServiceAbstraction } from "@bitwarden/common/platform/abstractions/state.service";

import { Account } from "../../../models/account";

export abstract class BrowserStateService extends BaseStateServiceAbstraction<Account> {}
