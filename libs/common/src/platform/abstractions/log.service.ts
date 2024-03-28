import { LogLevelType } from "../enums/log-level-type.enum";

export abstract class LogService {
  abstract debug(message: string): void;
  abstract info(message: string): void;
  abstract warning(message: string): void;
  abstract error(message: string): void;
  abstract write(level: LogLevelType, message: string): void;
}
