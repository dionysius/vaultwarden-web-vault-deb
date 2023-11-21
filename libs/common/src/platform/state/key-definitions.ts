import { AccountInfo } from "../../auth/abstractions/account.service";
import { AccountsDeserializer } from "../../auth/services/account.service";
import { UserId } from "../../types/guid";

import { KeyDefinition } from "./key-definition";
import { StateDefinition } from "./state-definition";

const ACCOUNT_MEMORY = new StateDefinition("account", "memory");
export const ACCOUNT_ACCOUNTS = new KeyDefinition<Record<UserId, AccountInfo>>(
  ACCOUNT_MEMORY,
  "accounts",
  {
    deserializer: (obj) => AccountsDeserializer(obj),
  }
);
export const ACCOUNT_ACTIVE_ACCOUNT_ID = new KeyDefinition(ACCOUNT_MEMORY, "activeAccountId", {
  deserializer: (id: UserId) => id,
});
