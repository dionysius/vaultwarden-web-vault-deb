import { mock } from "jest-mock-extended";

import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import { flushPromises, sendExtensionRuntimeMessage } from "../jest/testing-utils";
import AutofillPageDetails from "../models/autofill-page-details";
import AutofillScript from "../models/autofill-script";
import AutofillOverlayContentService from "../services/autofill-overlay-content.service";
import { RedirectFocusDirection } from "../utils/autofill-overlay.enum";

import { AutofillExtensionMessage } from "./abstractions/autofill-init";
import AutofillInit from "./autofill-init";

describe("AutofillInit", () => {
  let autofillInit: AutofillInit;
  const autofillOverlayContentService = mock<AutofillOverlayContentService>();

  beforeEach(() => {
    autofillInit = new AutofillInit(autofillOverlayContentService);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("sets up the extension message listeners", () => {
      jest.spyOn(autofillInit as any, "setupExtensionMessageListeners");

      autofillInit.init();

      expect(autofillInit["setupExtensionMessageListeners"]).toHaveBeenCalled();
    });
  });

  describe("setupExtensionMessageListeners", () => {
    it("sets up a chrome runtime on message listener", () => {
      jest.spyOn(chrome.runtime.onMessage, "addListener");

      autofillInit["setupExtensionMessageListeners"]();

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(
        autofillInit["handleExtensionMessage"],
      );
    });
  });

  describe("handleExtensionMessage", () => {
    let message: AutofillExtensionMessage;
    let sender: chrome.runtime.MessageSender;
    const sendResponse = jest.fn();

    beforeEach(() => {
      message = {
        command: "collectPageDetails",
        tab: mock<chrome.tabs.Tab>(),
        sender: "sender",
      };
      sender = mock<chrome.runtime.MessageSender>();
    });

    it("returns a undefined value if a extension message handler is not found with the given message command", () => {
      message.command = "unknownCommand";

      const response = autofillInit["handleExtensionMessage"](message, sender, sendResponse);

      expect(response).toBe(undefined);
    });

    it("returns a undefined value if the message handler does not return a response", async () => {
      const response1 = await autofillInit["handleExtensionMessage"](message, sender, sendResponse);
      await flushPromises();

      expect(response1).not.toBe(false);

      message.command = "removeAutofillOverlay";
      message.fillScript = mock<AutofillScript>();

      const response2 = autofillInit["handleExtensionMessage"](message, sender, sendResponse);
      await flushPromises();

      expect(response2).toBe(undefined);
    });

    it("returns a true value and calls sendResponse if the message handler returns a response", async () => {
      message.command = "collectPageDetailsImmediately";
      const pageDetails: AutofillPageDetails = {
        title: "title",
        url: "http://example.com",
        documentUrl: "documentUrl",
        forms: {},
        fields: [],
        collectedTimestamp: 0,
      };
      jest
        .spyOn(autofillInit["collectAutofillContentService"], "getPageDetails")
        .mockResolvedValue(pageDetails);

      const response = await autofillInit["handleExtensionMessage"](message, sender, sendResponse);
      await Promise.resolve(response);

      expect(response).toBe(true);
      expect(sendResponse).toHaveBeenCalledWith(pageDetails);
    });

    describe("extension message handlers", () => {
      beforeEach(() => {
        autofillInit.init();
      });

      describe("collectPageDetails", () => {
        it("sends the collected page details for autofill using a background script message", async () => {
          const pageDetails: AutofillPageDetails = {
            title: "title",
            url: "http://example.com",
            documentUrl: "documentUrl",
            forms: {},
            fields: [],
            collectedTimestamp: 0,
          };
          const message = {
            command: "collectPageDetails",
            sender: "sender",
            tab: mock<chrome.tabs.Tab>(),
          };
          jest
            .spyOn(autofillInit["collectAutofillContentService"], "getPageDetails")
            .mockResolvedValue(pageDetails);

          sendExtensionRuntimeMessage(message, sender, sendResponse);
          await flushPromises();

          expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
            command: "collectPageDetailsResponse",
            tab: message.tab,
            details: pageDetails,
            sender: message.sender,
          });
        });
      });

      describe("collectPageDetailsImmediately", () => {
        it("returns collected page details for autofill if set to send the details in the response", async () => {
          const pageDetails: AutofillPageDetails = {
            title: "title",
            url: "http://example.com",
            documentUrl: "documentUrl",
            forms: {},
            fields: [],
            collectedTimestamp: 0,
          };
          jest
            .spyOn(autofillInit["collectAutofillContentService"], "getPageDetails")
            .mockResolvedValue(pageDetails);

          sendExtensionRuntimeMessage(
            { command: "collectPageDetailsImmediately" },
            sender,
            sendResponse,
          );
          await flushPromises();

          expect(autofillInit["collectAutofillContentService"].getPageDetails).toHaveBeenCalled();
          expect(sendResponse).toBeCalledWith(pageDetails);
          expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
        });
      });

      describe("fillForm", () => {
        let fillScript: AutofillScript;
        beforeEach(() => {
          fillScript = mock<AutofillScript>();
          jest.spyOn(autofillInit["insertAutofillContentService"], "fillForm").mockImplementation();
        });

        it("skips calling the InsertAutofillContentService and does not fill the form if the url to fill is not equal to the current tab url", async () => {
          const fillScript = mock<AutofillScript>();
          const message = {
            command: "fillForm",
            fillScript,
            pageDetailsUrl: "https://a-different-url.com",
          };

          sendExtensionRuntimeMessage(message);
          await flushPromises();

          expect(autofillInit["insertAutofillContentService"].fillForm).not.toHaveBeenCalledWith(
            fillScript,
          );
        });

        it("calls the InsertAutofillContentService to fill the form", async () => {
          sendExtensionRuntimeMessage({
            command: "fillForm",
            fillScript,
            pageDetailsUrl: window.location.href,
          });
          await flushPromises();

          expect(autofillInit["insertAutofillContentService"].fillForm).toHaveBeenCalledWith(
            fillScript,
          );
        });

        it("updates the isCurrentlyFilling properties of the overlay and focus the recent field after filling", async () => {
          jest.useFakeTimers();
          jest.spyOn(autofillInit as any, "updateOverlayIsCurrentlyFilling");
          jest
            .spyOn(autofillInit["autofillOverlayContentService"], "focusMostRecentOverlayField")
            .mockImplementation();

          sendExtensionRuntimeMessage({
            command: "fillForm",
            fillScript,
            pageDetailsUrl: window.location.href,
          });
          await flushPromises();
          jest.advanceTimersByTime(300);

          expect(autofillInit["updateOverlayIsCurrentlyFilling"]).toHaveBeenNthCalledWith(1, true);
          expect(autofillInit["insertAutofillContentService"].fillForm).toHaveBeenCalledWith(
            fillScript,
          );
          expect(autofillInit["updateOverlayIsCurrentlyFilling"]).toHaveBeenNthCalledWith(2, false);
          expect(
            autofillInit["autofillOverlayContentService"].focusMostRecentOverlayField,
          ).toHaveBeenCalled();
        });

        it("skips attempting to focus the most recent field if the autofillOverlayContentService is not present", async () => {
          jest.useFakeTimers();
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();
          jest.spyOn(newAutofillInit as any, "updateOverlayIsCurrentlyFilling");
          jest
            .spyOn(newAutofillInit["insertAutofillContentService"], "fillForm")
            .mockImplementation();

          sendExtensionRuntimeMessage({
            command: "fillForm",
            fillScript,
            pageDetailsUrl: window.location.href,
          });
          await flushPromises();
          jest.advanceTimersByTime(300);

          expect(newAutofillInit["updateOverlayIsCurrentlyFilling"]).toHaveBeenNthCalledWith(
            1,
            true,
          );
          expect(newAutofillInit["insertAutofillContentService"].fillForm).toHaveBeenCalledWith(
            fillScript,
          );
          expect(newAutofillInit["updateOverlayIsCurrentlyFilling"]).not.toHaveBeenNthCalledWith(
            2,
            false,
          );
        });
      });

      describe("openAutofillOverlay", () => {
        const message = {
          command: "openAutofillOverlay",
          data: {
            isFocusingFieldElement: true,
            isOpeningFullOverlay: true,
            authStatus: AuthenticationStatus.Unlocked,
          },
        };

        it("skips attempting to open the autofill overlay if the autofillOverlayContentService is not present", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();

          sendExtensionRuntimeMessage(message);

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
        });

        it("opens the autofill overlay", () => {
          sendExtensionRuntimeMessage(message);

          expect(
            autofillInit["autofillOverlayContentService"].openAutofillOverlay,
          ).toHaveBeenCalledWith({
            isFocusingFieldElement: message.data.isFocusingFieldElement,
            isOpeningFullOverlay: message.data.isOpeningFullOverlay,
            authStatus: message.data.authStatus,
          });
        });
      });

      describe("closeAutofillOverlay", () => {
        beforeEach(() => {
          autofillInit["autofillOverlayContentService"].isFieldCurrentlyFocused = false;
          autofillInit["autofillOverlayContentService"].isCurrentlyFilling = false;
        });

        it("skips attempting to remove the overlay if the autofillOverlayContentService is not present", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();
          jest.spyOn(newAutofillInit as any, "removeAutofillOverlay");

          sendExtensionRuntimeMessage({
            command: "closeAutofillOverlay",
            data: { forceCloseOverlay: false },
          });

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
        });

        it("removes the autofill overlay if the message flags a forced closure", () => {
          sendExtensionRuntimeMessage({
            command: "closeAutofillOverlay",
            data: { forceCloseOverlay: true },
          });

          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlay,
          ).toHaveBeenCalled();
        });

        it("ignores the message if a field is currently focused", () => {
          autofillInit["autofillOverlayContentService"].isFieldCurrentlyFocused = true;

          sendExtensionRuntimeMessage({ command: "closeAutofillOverlay" });

          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlayList,
          ).not.toHaveBeenCalled();
          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlay,
          ).not.toHaveBeenCalled();
        });

        it("removes the autofill overlay list if the overlay is currently filling", () => {
          autofillInit["autofillOverlayContentService"].isCurrentlyFilling = true;

          sendExtensionRuntimeMessage({ command: "closeAutofillOverlay" });

          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlayList,
          ).toHaveBeenCalled();
          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlay,
          ).not.toHaveBeenCalled();
        });

        it("removes the entire overlay if the overlay is not currently filling", () => {
          sendExtensionRuntimeMessage({ command: "closeAutofillOverlay" });

          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlayList,
          ).not.toHaveBeenCalled();
          expect(
            autofillInit["autofillOverlayContentService"].removeAutofillOverlay,
          ).toHaveBeenCalled();
        });
      });

      describe("addNewVaultItemFromOverlay", () => {
        it("will not add a new vault item if the autofillOverlayContentService is not present", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();

          sendExtensionRuntimeMessage({ command: "addNewVaultItemFromOverlay" });

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
        });

        it("will add a new vault item", () => {
          sendExtensionRuntimeMessage({ command: "addNewVaultItemFromOverlay" });

          expect(autofillInit["autofillOverlayContentService"].addNewVaultItem).toHaveBeenCalled();
        });
      });

      describe("redirectOverlayFocusOut", () => {
        const message = {
          command: "redirectOverlayFocusOut",
          data: {
            direction: RedirectFocusDirection.Next,
          },
        };

        it("ignores the message to redirect focus if the autofillOverlayContentService does not exist", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();

          sendExtensionRuntimeMessage(message);

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
        });

        it("redirects the overlay focus", () => {
          sendExtensionRuntimeMessage(message);

          expect(
            autofillInit["autofillOverlayContentService"].redirectOverlayFocusOut,
          ).toHaveBeenCalledWith(message.data.direction);
        });
      });

      describe("updateIsOverlayCiphersPopulated", () => {
        const message = {
          command: "updateIsOverlayCiphersPopulated",
          data: {
            isOverlayCiphersPopulated: true,
          },
        };

        it("skips updating whether the ciphers are populated if the autofillOverlayContentService does note exist", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();

          sendExtensionRuntimeMessage(message);

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
        });

        it("updates whether the overlay ciphers are populated", () => {
          sendExtensionRuntimeMessage(message);

          expect(autofillInit["autofillOverlayContentService"].isOverlayCiphersPopulated).toEqual(
            message.data.isOverlayCiphersPopulated,
          );
        });
      });

      describe("bgUnlockPopoutOpened", () => {
        it("skips attempting to blur and remove the overlay if the autofillOverlayContentService is not present", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();
          jest.spyOn(newAutofillInit as any, "removeAutofillOverlay");

          sendExtensionRuntimeMessage({ command: "bgUnlockPopoutOpened" });

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
          expect(newAutofillInit["removeAutofillOverlay"]).not.toHaveBeenCalled();
        });

        it("blurs the most recently focused feel and remove the autofill overlay", () => {
          jest.spyOn(autofillInit["autofillOverlayContentService"], "blurMostRecentOverlayField");
          jest.spyOn(autofillInit as any, "removeAutofillOverlay");

          sendExtensionRuntimeMessage({ command: "bgUnlockPopoutOpened" });

          expect(
            autofillInit["autofillOverlayContentService"].blurMostRecentOverlayField,
          ).toHaveBeenCalled();
          expect(autofillInit["removeAutofillOverlay"]).toHaveBeenCalled();
        });
      });

      describe("bgVaultItemRepromptPopoutOpened", () => {
        it("skips attempting to blur and remove the overlay if the autofillOverlayContentService is not present", () => {
          const newAutofillInit = new AutofillInit(undefined);
          newAutofillInit.init();
          jest.spyOn(newAutofillInit as any, "removeAutofillOverlay");

          sendExtensionRuntimeMessage({ command: "bgVaultItemRepromptPopoutOpened" });

          expect(newAutofillInit["autofillOverlayContentService"]).toBe(undefined);
          expect(newAutofillInit["removeAutofillOverlay"]).not.toHaveBeenCalled();
        });

        it("blurs the most recently focused feel and remove the autofill overlay", () => {
          jest.spyOn(autofillInit["autofillOverlayContentService"], "blurMostRecentOverlayField");
          jest.spyOn(autofillInit as any, "removeAutofillOverlay");

          sendExtensionRuntimeMessage({ command: "bgVaultItemRepromptPopoutOpened" });

          expect(
            autofillInit["autofillOverlayContentService"].blurMostRecentOverlayField,
          ).toHaveBeenCalled();
          expect(autofillInit["removeAutofillOverlay"]).toHaveBeenCalled();
        });
      });
    });
  });
});
