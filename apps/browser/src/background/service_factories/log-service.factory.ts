import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LogLevelType } from "@bitwarden/common/enums/logLevelType";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";

type LogServiceFactoryOptions = FactoryOptions & {
  logServiceOptions: {
    isDev: boolean;
    filter?: (level: LogLevelType) => boolean;
  };
};

export type LogServiceInitOptions = LogServiceFactoryOptions;

export function logServiceFactory(
  cache: { logService?: LogService } & CachedServices,
  opts: LogServiceInitOptions
): Promise<LogService> {
  return factory(
    cache,
    "logService",
    opts,
    () => new ConsoleLogService(opts.logServiceOptions.isDev, opts.logServiceOptions.filter)
  );
}
