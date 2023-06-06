import { Injectable } from "@angular/core";
import { fromEvent, Subscription } from "rxjs";

import { BrowserApi } from "../../platform/browser/browser-api";

@Injectable()
export class PopupUtilsService {
  private unloadSubscription: Subscription;

  constructor(private privateMode: boolean = false) {}

  inSidebar(win: Window): boolean {
    return win.location.search !== "" && win.location.search.indexOf("uilocation=sidebar") > -1;
  }

  inTab(win: Window): boolean {
    return win.location.search !== "" && win.location.search.indexOf("uilocation=tab") > -1;
  }

  inPopout(win: Window): boolean {
    return win.location.search !== "" && win.location.search.indexOf("uilocation=popout") > -1;
  }

  inPopup(win: Window): boolean {
    return (
      win.location.search === "" ||
      win.location.search.indexOf("uilocation=") === -1 ||
      win.location.search.indexOf("uilocation=popup") > -1
    );
  }

  inPrivateMode(): boolean {
    return this.privateMode;
  }

  getContentScrollY(win: Window, scrollingContainer = "main"): number {
    const content = win.document.getElementsByTagName(scrollingContainer)[0];
    return content.scrollTop;
  }

  setContentScrollY(win: Window, scrollY: number, scrollingContainer = "main"): void {
    if (scrollY != null) {
      const content = win.document.getElementsByTagName(scrollingContainer)[0];
      content.scrollTop = scrollY;
    }
  }

  popOut(win: Window, href: string = null): void {
    if (href === null) {
      href = win.location.href;
    }

    if (typeof chrome !== "undefined" && chrome.windows && chrome.windows.create) {
      if (href.indexOf("?uilocation=") > -1) {
        href = href
          .replace("uilocation=popup", "uilocation=popout")
          .replace("uilocation=tab", "uilocation=popout")
          .replace("uilocation=sidebar", "uilocation=popout");
      } else {
        const hrefParts = href.split("#");
        href =
          hrefParts[0] + "?uilocation=popout" + (hrefParts.length > 0 ? "#" + hrefParts[1] : "");
      }

      const bodyRect = document.querySelector("body").getBoundingClientRect();
      chrome.windows.create({
        url: href,
        type: "popup",
        width: Math.round(bodyRect.width ? bodyRect.width + 60 : 375),
        height: Math.round(bodyRect.height || 600),
      });

      if (this.inPopup(win)) {
        BrowserApi.closePopup(win);
      }
    } else if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      href = href
        .replace("uilocation=popup", "uilocation=tab")
        .replace("uilocation=popout", "uilocation=tab")
        .replace("uilocation=sidebar", "uilocation=tab");
      chrome.tabs.create({
        url: href,
      });
    }
  }

  /**
   * Enables a pop-up warning before the user exits the window/tab, or navigates away.
   * This warns the user that they may lose unsaved data if they leave the page.
   * (Note: navigating within the Angular app will not trigger it because it's an SPA.)
   * Make sure you call `disableTabCloseWarning` when it is no longer relevant.
   */
  enableCloseTabWarning() {
    this.disableCloseTabWarning();

    this.unloadSubscription = fromEvent(window, "beforeunload").subscribe(
      (e: BeforeUnloadEvent) => {
        // Recommended method but not widely supported
        e.preventDefault();

        // Modern browsers do not display this message, it just needs to be a non-nullish value
        // Exact wording is determined by the browser
        const confirmationMessage = "";

        // Older methods with better support
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    );
  }

  /**
   * Disables the warning enabled by enableCloseTabWarning.
   */
  disableCloseTabWarning() {
    this.unloadSubscription?.unsubscribe();
  }
}
