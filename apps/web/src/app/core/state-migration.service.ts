import { StateMigrationService as BaseStateMigrationService } from "@bitwarden/common/services/stateMigration.service";

import { Account } from "./state/account";
import { GlobalState } from "./state/global-state";

export class StateMigrationService extends BaseStateMigrationService<GlobalState, Account> {
  protected async migrationStateFrom1To2(): Promise<void> {
    await super.migrateStateFrom1To2();
    const globals = (await this.get<GlobalState>("global")) ?? this.stateFactory.createGlobal(null);
    globals.rememberEmail = (await this.get<boolean>("rememberEmail")) ?? globals.rememberEmail;
    await this.set("global", globals);
  }
}
