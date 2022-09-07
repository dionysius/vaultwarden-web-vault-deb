import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";

import { interceptConsole, restoreConsole } from "../shared/interceptConsole";

let caughtMessage: any;

describe("ConsoleLogService", () => {
  let logService: ConsoleLogService;
  beforeEach(() => {
    caughtMessage = {};
    interceptConsole(caughtMessage);
    logService = new ConsoleLogService(true);
  });

  afterAll(() => {
    restoreConsole();
  });

  it("filters messages below the set threshold", () => {
    logService = new ConsoleLogService(true, () => true);
    logService.debug("debug");
    logService.info("info");
    logService.warning("warning");
    logService.error("error");

    expect(caughtMessage).toEqual({});
  });
  it("only writes debug messages in dev mode", () => {
    logService = new ConsoleLogService(false);

    logService.debug("debug message");
    expect(caughtMessage.log).toBeUndefined();
  });

  it("writes debug/info messages to console.log", () => {
    logService.debug("this is a debug message");
    expect(caughtMessage).toMatchObject({
      log: { "0": "this is a debug message" },
    });

    logService.info("this is an info message");
    expect(caughtMessage).toMatchObject({
      log: { "0": "this is an info message" },
    });
  });
  it("writes warning messages to console.warn", () => {
    logService.warning("this is a warning message");
    expect(caughtMessage).toMatchObject({
      warn: { 0: "this is a warning message" },
    });
  });
  it("writes error messages to console.error", () => {
    logService.error("this is an error message");
    expect(caughtMessage).toMatchObject({
      error: { 0: "this is an error message" },
    });
  });
});
