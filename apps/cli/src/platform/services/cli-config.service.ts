import { NEVER } from "rxjs";

import { ConfigService } from "@bitwarden/common/platform/services/config/config.service";

export class CliConfigService extends ConfigService {
  // The rxjs timer uses setTimeout/setInterval under the hood, which prevents the node process from exiting
  // when the command is finished. Cli should never be alive long enough to use the timer, so we disable it.
  protected refreshTimer$ = NEVER;
}
