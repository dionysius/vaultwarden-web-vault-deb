import { ErrorHandler, Injectable } from "@angular/core";

import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

@Injectable()
export class LoggingErrorHandler extends ErrorHandler {
  constructor(private readonly logService: LogService) {
    super();
  }

  override handleError(error: any): void {
    this.logService.error(error);
  }
}
