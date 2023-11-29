import * as path from "path";

import log from "electron-log";

import { LogLevelType } from "@bitwarden/common/platform/enums/log-level-type.enum";
import { ConsoleLogService as BaseLogService } from "@bitwarden/common/platform/services/console-log.service";

import { isDev } from "../../utils";

export class ElectronLogService extends BaseLogService {
  constructor(
    protected filter: (level: LogLevelType) => boolean = null,
    private logDir: string = null,
  ) {
    super(isDev(), filter);
  }

  // Initialize the log file transport. Only needs to be done once in the main process.
  init() {
    if (log.transports == null) {
      return;
    }

    log.transports.file.level = "info";
    if (this.logDir != null) {
      log.transports.file.resolvePathFn = () => path.join(this.logDir, "app.log");
    }
    log.initialize();
  }

  write(level: LogLevelType, message: string) {
    if (this.filter != null && this.filter(level)) {
      return;
    }

    switch (level) {
      case LogLevelType.Debug:
        log.debug(message);
        break;
      case LogLevelType.Info:
        log.info(message);
        break;
      case LogLevelType.Warning:
        log.warn(message);
        break;
      case LogLevelType.Error:
        log.error(message);
        break;
      default:
        break;
    }
  }
}
