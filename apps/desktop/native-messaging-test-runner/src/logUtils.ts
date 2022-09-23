/* eslint-disable no-console */

// Class for logging messages with colors for ease of reading important info
// Reference: https://stackoverflow.com/a/41407246
export class LogUtils {
  static logSuccess(message: string, payload?: any): void {
    this.logFormat(message, "32", payload);
  }

  static logWarning(message: string, payload?: any): void {
    this.logFormat(message, "33", payload);
  }

  static logError(message: string, payload?: any): void {
    this.logFormat(message, "31", payload);
  }

  static logInfo(message: string, payload?: any): void {
    this.logFormat(message, "36", payload);
  }

  private static logFormat(message: string, color: string, payload?: any) {
    if (payload) {
      console.log(`\x1b[${color}m ${message} \x1b[0m`, payload);
    } else {
      console.log(`\x1b[${color}m ${message} \x1b[0m`);
    }
  }
}
