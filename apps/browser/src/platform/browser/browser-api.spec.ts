import { mock } from "jest-mock-extended";

import { BrowserApi } from "./browser-api";

describe("BrowserApi", () => {
  const executeScriptResult = ["value"];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getWindow", () => {
    it("will get the current window if a window id is not provided", () => {
      BrowserApi.getWindow();

      expect(chrome.windows.getCurrent).toHaveBeenCalledWith({ populate: true }, expect.anything());
    });

    it("will get the window with the provided id if one is provided", () => {
      const windowId = 1;

      BrowserApi.getWindow(windowId);

      expect(chrome.windows.get).toHaveBeenCalledWith(
        windowId,
        { populate: true },
        expect.anything(),
      );
    });
  });

  describe("getCurrentWindow", () => {
    it("will get the current window", () => {
      BrowserApi.getCurrentWindow();

      expect(chrome.windows.getCurrent).toHaveBeenCalledWith({ populate: true }, expect.anything());
    });
  });

  describe("getWindowById", () => {
    it("will get the window associated with the passed window id", () => {
      const windowId = 1;

      BrowserApi.getWindowById(windowId);

      expect(chrome.windows.get).toHaveBeenCalledWith(
        windowId,
        { populate: true },
        expect.anything(),
      );
    });
  });

  describe("removeWindow", () => {
    it("removes the window based on the passed window id", () => {
      const windowId = 10;

      BrowserApi.removeWindow(windowId);

      expect(chrome.windows.remove).toHaveBeenCalledWith(windowId, expect.anything());
    });
  });

  describe("updateWindowProperties", () => {
    it("will update the window with the provided window options", () => {
      const windowId = 1;
      const windowOptions: chrome.windows.UpdateInfo = {
        focused: true,
      };

      BrowserApi.updateWindowProperties(windowId, windowOptions);

      expect(chrome.windows.update).toHaveBeenCalledWith(
        windowId,
        windowOptions,
        expect.anything(),
      );
    });
  });

  describe("focusWindow", () => {
    it("will focus the window with the provided window id", () => {
      const windowId = 1;

      BrowserApi.focusWindow(windowId);

      expect(chrome.windows.update).toHaveBeenCalledWith(
        windowId,
        { focused: true },
        expect.anything(),
      );
    });
  });

  describe("executeScriptInTab", () => {
    it("calls to the extension api to execute a script within the give tabId", async () => {
      const tabId = 1;
      const injectDetails = mock<chrome.tabs.InjectDetails>();
      jest.spyOn(BrowserApi, "manifestVersion", "get").mockReturnValue(2);
      (chrome.tabs.executeScript as jest.Mock).mockImplementation(
        (tabId, injectDetails, callback) => callback(executeScriptResult),
      );

      const result = await BrowserApi.executeScriptInTab(tabId, injectDetails);

      expect(chrome.tabs.executeScript).toHaveBeenCalledWith(
        tabId,
        injectDetails,
        expect.any(Function),
      );
      expect(result).toEqual(executeScriptResult);
    });

    it("calls the manifest v3 scripting API if the extension manifest is for v3", async () => {
      const tabId = 1;
      const injectDetails = mock<chrome.tabs.InjectDetails>({
        file: "file.js",
        allFrames: true,
        runAt: "document_start",
        frameId: null,
      });
      jest.spyOn(BrowserApi, "manifestVersion", "get").mockReturnValue(3);
      (chrome.scripting.executeScript as jest.Mock).mockResolvedValue(executeScriptResult);

      const result = await BrowserApi.executeScriptInTab(tabId, injectDetails);

      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: {
          tabId: tabId,
          allFrames: injectDetails.allFrames,
          frameIds: null,
        },
        files: [injectDetails.file],
        injectImmediately: true,
      });
      expect(result).toEqual(executeScriptResult);
    });
  });
});
