import { UserKeyDefinition } from "@bitwarden/common/platform/state";
import { Constraints } from "@bitwarden/common/tools/types";

import { PolicyConfiguration } from "../types";

export type CredentialGeneratorConfiguration<Settings, Policy> = {
  settings: {
    /** value used when an account's settings haven't been initialized */
    initial: Readonly<Partial<Settings>>;

    constraints: Constraints<Settings>;

    /** storage location for account-global settings */
    account: UserKeyDefinition<Settings>;
  };

  /** defines how to construct policy for this settings instance */
  policy: PolicyConfiguration<Policy, Settings>;
};
