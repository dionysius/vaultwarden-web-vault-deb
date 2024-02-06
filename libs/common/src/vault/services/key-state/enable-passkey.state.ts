import { VAULT_SETTINGS_DISK, KeyDefinition } from "../../../platform/state";

export const USER_ENABLE_PASSKEYS = new KeyDefinition<boolean>(
  VAULT_SETTINGS_DISK,
  "enablePasskeys",
  {
    deserializer: (obj) => obj,
  },
);
