import { mock, MockProxy } from "jest-mock-extended";

import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { setAlarmTime } from "../../platform/alarms/alarm-state";
import { BrowserApi } from "../../platform/browser/browser-api";
import { BrowserStateService } from "../../platform/services/abstractions/browser-state.service";

import { clearClipboardAlarmName } from "./clear-clipboard";
import { GeneratePasswordToClipboardCommand } from "./generate-password-to-clipboard-command";

jest.mock("../../platform/alarms/alarm-state", () => {
  return {
    setAlarmTime: jest.fn(),
  };
});

const setAlarmTimeMock = setAlarmTime as jest.Mock;

describe("GeneratePasswordToClipboardCommand", () => {
  let passwordGenerationService: MockProxy<PasswordGenerationServiceAbstraction>;
  let stateService: MockProxy<BrowserStateService>;

  let sut: GeneratePasswordToClipboardCommand;

  beforeEach(() => {
    passwordGenerationService = mock<PasswordGenerationServiceAbstraction>();
    stateService = mock<BrowserStateService>();

    passwordGenerationService.getOptions.mockResolvedValue([{ length: 8 }, {} as any]);

    passwordGenerationService.generatePassword.mockResolvedValue("PASSWORD");

    jest.spyOn(BrowserApi, "sendTabsMessage").mockReturnValue();

    sut = new GeneratePasswordToClipboardCommand(passwordGenerationService, stateService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("generatePasswordToClipboard", () => {
    it("has clear clipboard value", async () => {
      stateService.getClearClipboard.mockResolvedValue(5 * 60); // 5 minutes

      await sut.generatePasswordToClipboard({ id: 1 } as any);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "copyText",
        text: "PASSWORD",
      });

      expect(setAlarmTimeMock).toHaveBeenCalledTimes(1);

      expect(setAlarmTimeMock).toHaveBeenCalledWith(clearClipboardAlarmName, expect.any(Number));
    });

    it("does not have clear clipboard value", async () => {
      stateService.getClearClipboard.mockResolvedValue(null);

      await sut.generatePasswordToClipboard({ id: 1 } as any);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "copyText",
        text: "PASSWORD",
      });

      expect(setAlarmTimeMock).not.toHaveBeenCalled();
    });
  });
});
