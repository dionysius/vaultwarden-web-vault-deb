import { mock, MockProxy } from "jest-mock-extended";

import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";

import { BrowserApi } from "../browser/browserApi";
import { StateService } from "../services/abstractions/state.service";

import { setClearClipboardTime } from "./clipboard-state";
import { GeneratePasswordToClipboardCommand } from "./generate-password-to-clipboard-command";

jest.mock("./clipboard-state", () => {
  return {
    getClearClipboardTime: jest.fn(),
    setClearClipboardTime: jest.fn(),
  };
});

const setClearClipboardTimeMock = setClearClipboardTime as jest.Mock;

describe("GeneratePasswordToClipboardCommand", () => {
  let passwordGenerationService: MockProxy<PasswordGenerationService>;
  let stateService: MockProxy<StateService>;

  let sut: GeneratePasswordToClipboardCommand;

  beforeEach(() => {
    passwordGenerationService = mock<PasswordGenerationService>();
    stateService = mock<StateService>();

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

      expect(setClearClipboardTimeMock).toHaveBeenCalledTimes(1);

      expect(setClearClipboardTimeMock).toHaveBeenCalledWith(stateService, expect.any(Number));
    });

    it("does not have clear clipboard value", async () => {
      stateService.getClearClipboard.mockResolvedValue(null);

      await sut.generatePasswordToClipboard({ id: 1 } as any);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "copyText",
        text: "PASSWORD",
      });

      expect(setClearClipboardTimeMock).not.toHaveBeenCalled();
    });
  });
});
