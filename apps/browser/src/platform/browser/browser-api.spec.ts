import { mock } from "jest-mock-extended";

import { BrowserApi } from "./browser-api";

describe("BrowserApi", () => {
  const executeScriptResult = ["value"];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getWindow", () => {
    it("will get the current window if a window id is not provided", () => {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.getWindow();

      expect(chrome.windows.getCurrent).toHaveBeenCalledWith({ populate: true }, expect.anything());
    });

    it("will get the window with the provided id if one is provided", () => {
      const windowId = 1;

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      BrowserApi.getCurrentWindow();

      expect(chrome.windows.getCurrent).toHaveBeenCalledWith({ populate: true }, expect.anything());
    });
  });

  describe("getWindowById", () => {
    it("will get the window associated with the passed window id", () => {
      const windowId = 1;

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

  describe("browserAutofillSettingsOverridden", () => {
    it("returns true if the browser autofill settings are overridden", async () => {
      const expectedDetails = {
        value: false,
        levelOfControl: "controlled_by_this_extension",
      } as chrome.types.ChromeSettingGetResultDetails;
      chrome.privacy.services.autofillAddressEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.autofillCreditCardEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.passwordSavingEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );

      const result = await BrowserApi.browserAutofillSettingsOverridden();

      expect(result).toBe(true);
    });

    it("returns false if the browser autofill settings are not overridden", async () => {
      const expectedDetails = {
        value: true,
        levelOfControl: "controlled_by_this_extension",
      } as chrome.types.ChromeSettingGetResultDetails;
      chrome.privacy.services.autofillAddressEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.autofillCreditCardEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.passwordSavingEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );

      const result = await BrowserApi.browserAutofillSettingsOverridden();

      expect(result).toBe(false);
    });

    it("returns false if the browser autofill settings are not controlled by the extension", async () => {
      const expectedDetails = {
        value: false,
        levelOfControl: "controlled_by_other_extensions",
      } as chrome.types.ChromeSettingGetResultDetails;
      chrome.privacy.services.autofillAddressEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.autofillCreditCardEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );
      chrome.privacy.services.passwordSavingEnabled.get = jest.fn((details, callback) =>
        callback(expectedDetails),
      );

      const result = await BrowserApi.browserAutofillSettingsOverridden();

      expect(result).toBe(false);
    });
  });

  describe("updateDefaultBrowserAutofillSettings", () => {
    it("updates the default browser autofill settings", async () => {
      await BrowserApi.updateDefaultBrowserAutofillSettings(false);

      expect(chrome.privacy.services.autofillAddressEnabled.set).toHaveBeenCalledWith({
        value: false,
      });
      expect(chrome.privacy.services.autofillCreditCardEnabled.set).toHaveBeenCalledWith({
        value: false,
      });
      expect(chrome.privacy.services.passwordSavingEnabled.set).toHaveBeenCalledWith({
        value: false,
      });
    });
  });
});
