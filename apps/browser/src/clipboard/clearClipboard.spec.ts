import { mock, MockProxy } from "jest-mock-extended";

import { BrowserApi } from "../browser/browserApi";
import { StateService } from "../services/abstractions/state.service";

import { ClearClipboard } from "./clearClipboard";
import { getClearClipboardTime, setClearClipboardTime } from "./clipboard-state";

jest.mock("./clipboard-state", () => {
  return {
    getClearClipboardTime: jest.fn(),
    setClearClipboardTime: jest.fn(),
  };
});

const getClearClipboardTimeMock = getClearClipboardTime as jest.Mock;
const setClearClipboardTimeMock = setClearClipboardTime as jest.Mock;

describe("clearClipboard", () => {
  describe("run", () => {
    let stateService: MockProxy<StateService>;
    let serviceCache: Record<string, unknown>;

    beforeEach(() => {
      stateService = mock<StateService>();
      serviceCache = {
        stateService: stateService,
      };
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("has a clear time that is past execution time", async () => {
      const executionTime = new Date(2022, 1, 1, 12);
      const clearTime = new Date(2022, 1, 1, 12, 1);

      jest.spyOn(BrowserApi, "getActiveTabs").mockResolvedValue([
        {
          id: 1,
        },
      ] as any);

      jest.spyOn(BrowserApi, "sendTabsMessage").mockReturnValue();

      getClearClipboardTimeMock.mockResolvedValue(clearTime.getTime());

      await ClearClipboard.run(executionTime, serviceCache);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "clearClipboard",
      });
    });

    it("has a clear time before execution time", async () => {
      const executionTime = new Date(2022, 1, 1, 12);
      const clearTime = new Date(2022, 1, 1, 11);

      setClearClipboardTimeMock.mockResolvedValue(clearTime.getTime());

      await ClearClipboard.run(executionTime, serviceCache);

      expect(jest.spyOn(BrowserApi, "getActiveTabs")).not.toHaveBeenCalled();
    });

    it("has an undefined clearTime", async () => {
      const executionTime = new Date(2022, 1, 1);

      getClearClipboardTimeMock.mockResolvedValue(undefined);

      await ClearClipboard.run(executionTime, serviceCache);

      expect(jest.spyOn(BrowserApi, "getActiveTabs")).not.toHaveBeenCalled();
    });
  });
});
