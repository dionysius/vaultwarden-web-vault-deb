import { LogLevelType } from "@bitwarden/common/platform/enums/log-level-type.enum";
import { ConsoleLogService as BaseConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";

export class ConsoleLogService extends BaseConsoleLogService {
  constructor(isDev: boolean, filter: (level: LogLevelType) => boolean = null) {
    super(isDev, filter);
  }

  write(level: LogLevelType, message: string) {
    if (this.filter != null && this.filter(level)) {
      return;
    }

    if (process.env.BW_RESPONSE === "true") {
      // eslint-disable-next-line
      console.error(message);
      return;
    }

    super.write(level, message);
  }
}
