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

  describe("getBackgroundPage", () => {
    it("returns a null value if the `getBackgroundPage` method is not available", () => {
      chrome.extension.getBackgroundPage = undefined;

      const result = BrowserApi.getBackgroundPage();

      expect(result).toBeNull();
    });

    it("returns the background page if the `getBackgroundPage` method is available", () => {
      chrome.extension.getBackgroundPage = jest.fn().mockReturnValue(window);

      const result = BrowserApi.getBackgroundPage();

      expect(result).toEqual(window);
    });
  });

  describe("isBackgroundPage", () => {
    it("returns false if the passed window is `undefined`", () => {
      const result = BrowserApi.isBackgroundPage(undefined);

      expect(result).toBe(false);
    });

    it("returns false if the current window is not the background page", () => {
      chrome.extension.getBackgroundPage = jest.fn().mockReturnValue(null);

      const result = BrowserApi.isBackgroundPage(window);

      expect(result).toBe(false);
    });

    it("returns true if the current window is the background page", () => {
      chrome.extension.getBackgroundPage = jest.fn().mockReturnValue(window);

      const result = BrowserApi.isBackgroundPage(window);

      expect(result).toBe(true);
    });
  });

  describe("getExtensionViews", () => {
    it("returns an empty array if the `getViews` method is not available", () => {
      chrome.extension.getViews = undefined;

      const result = BrowserApi.getExtensionViews();

      expect(result).toEqual([]);
    });

    it("returns the extension views if the `getViews` method is available", () => {
      const views = [window];
      chrome.extension.getViews = jest.fn().mockReturnValue(views);

      const result = BrowserApi.getExtensionViews();

      expect(result).toEqual(views);
    });
  });

  describe("isPopupOpen", () => {
    it("returns true if the popup is open", async () => {
      chrome.extension.getViews = jest.fn().mockReturnValue([window]);

      const result = await BrowserApi.isPopupOpen();

      expect(result).toBe(true);
    });

    it("returns false if the popup is not open", async () => {
      chrome.extension.getViews = jest.fn().mockReturnValue([]);

      const result = await BrowserApi.isPopupOpen();

      expect(result).toBe(false);
    });
  });

  describe("reloadOpenWindows", () => {
    const href = window.location.href;
    const reload = window.location.reload;

    afterEach(() => {
      window.location.href = href;
      window.location.reload = reload;
    });

    it("reloads all open windows", () => {
      Object.defineProperty(window, "location", {
        value: { reload: jest.fn(), href: "chrome-extension://id-value/index.html" },
        writable: true,
      });
      const views = [window];
      chrome.extension.getViews = jest.fn().mockReturnValue(views);

      BrowserApi.reloadOpenWindows();

      expect(window.location.reload).toHaveBeenCalledTimes(views.length);
    });

    it("skips reloading the background page", () => {
      Object.defineProperty(window, "location", {
        value: { reload: jest.fn(), href: "chrome-extension://id-value/background.html" },
        writable: true,
      });
      const views = [window];
      chrome.extension.getViews = jest.fn().mockReturnValue(views);
      chrome.extension.getBackgroundPage = jest.fn().mockReturnValue(window);

      BrowserApi.reloadOpenWindows();

      expect(window.location.reload).toHaveBeenCalledTimes(0);
    });

    it("skips reloading the current href if it is exempt", () => {
      Object.defineProperty(window, "location", {
        value: { reload: jest.fn(), href: "chrome-extension://id-value/index.html" },
        writable: true,
      });
      const mockWindow = mock<Window>({
        location: {
          href: "chrome-extension://id-value/sidebar.html",
          reload: jest.fn(),
        },
      });
      const views = [window, mockWindow];
      chrome.extension.getViews = jest.fn().mockReturnValue(views);
      window.location.href = "chrome-extension://id-value/index.html";

      BrowserApi.reloadOpenWindows(true);

      expect(window.location.reload).toHaveBeenCalledTimes(0);
      expect(mockWindow.location.reload).toHaveBeenCalledTimes(1);
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
