import * as Mousetrap from "mousetrap";

document.addEventListener("DOMContentLoaded", (event) => {
  const isSafari =
    typeof safari !== "undefined" &&
    navigator.userAgent.indexOf(" Safari/") !== -1 &&
    navigator.userAgent.indexOf("Chrome") === -1;
  const isVivaldi = !isSafari && navigator.userAgent.indexOf(" Vivaldi/") !== -1;

  if (!isSafari && !isVivaldi) {
    return;
  }

  if (isSafari && (window as any).__bitwardenFrameId == null) {
    (window as any).__bitwardenFrameId = Math.floor(Math.random() * Math.floor(99999999));
  }

  Mousetrap.prototype.stopCallback = () => {
    return false;
  };

  let autofillCommand = ["mod+shift+l"];
  if (isSafari) {
    autofillCommand = ["mod+\\", "mod+8", "mod+shift+p"];
  }
  Mousetrap.bind(autofillCommand, () => {
    sendMessage("autofill_login");
  });

  if (isSafari) {
    Mousetrap.bind("mod+shift+y", () => {
      sendMessage("open_popup");
    });

    Mousetrap.bind("mod+shift+s", () => {
      sendMessage("lock_vault");
    });
  } else {
    Mousetrap.bind("mod+shift+9", () => {
      sendMessage("generate_password");
    });
  }

  function sendMessage(shortcut: string) {
    const msg: any = {
      command: "keyboardShortcutTriggered",
      shortcut: shortcut,
    };

    chrome.runtime.sendMessage(msg);
  }
});
