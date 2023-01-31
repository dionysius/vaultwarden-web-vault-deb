import { BrowserApi } from "../../browser/browserApi";

import { ClearClipboard } from "./clear-clipboard";

describe("clearClipboard", () => {
  describe("run", () => {
    it("Does not clear clipboard when no active tabs are retrieved", async () => {
      jest.spyOn(BrowserApi, "getActiveTabs").mockResolvedValue([] as any);

      jest.spyOn(BrowserApi, "sendTabsMessage").mockReturnValue();

      await ClearClipboard.run();

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).not.toHaveBeenCalled();

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).not.toHaveBeenCalledWith(1, {
        command: "clearClipboard",
      });
    });

    it("Sends a message to the content script to clear the clipboard", async () => {
      jest.spyOn(BrowserApi, "getActiveTabs").mockResolvedValue([
        {
          id: 1,
        },
      ] as any);

      jest.spyOn(BrowserApi, "sendTabsMessage").mockReturnValue();

      await ClearClipboard.run();

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "clearClipboard",
      });
    });
  });
});
