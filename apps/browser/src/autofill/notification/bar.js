// eslint-disable-next-line
require("./bar.scss");

document.addEventListener("DOMContentLoaded", () => {
  const theme = getQueryVariable("theme");
  document.documentElement.classList.add("theme_" + theme);

  let i18n = {};
  let lang = window.navigator.language;

  i18n.appName = chrome.i18n.getMessage("appName");
  i18n.close = chrome.i18n.getMessage("close");
  i18n.never = chrome.i18n.getMessage("never");
  i18n.folder = chrome.i18n.getMessage("folder");
  i18n.notificationAddSave = chrome.i18n.getMessage("notificationAddSave");
  i18n.notificationAddDesc = chrome.i18n.getMessage("notificationAddDesc");
  i18n.notificationChangeSave = chrome.i18n.getMessage("notificationChangeSave");
  i18n.notificationChangeDesc = chrome.i18n.getMessage("notificationChangeDesc");
  lang = chrome.i18n.getUILanguage(); // eslint-disable-line

  // delay 50ms so that we get proper body dimensions
  setTimeout(load, 50);

  function load() {
    const isVaultLocked = getQueryVariable("isVaultLocked") == "true";
    document.getElementById("logo").src = isVaultLocked
      ? chrome.runtime.getURL("images/icon38_locked.png")
      : chrome.runtime.getURL("images/icon38.png");

    document.getElementById("logo-link").title = i18n.appName;

    var neverButton = document.querySelector("#template-add .never-save");
    neverButton.textContent = i18n.never;

    var selectFolder = document.querySelector("#template-add .select-folder");
    selectFolder.setAttribute("aria-label", i18n.folder);
    selectFolder.setAttribute("isVaultLocked", isVaultLocked.toString());

    var addButton = document.querySelector("#template-add .add-save");
    addButton.textContent = i18n.notificationAddSave;

    var changeButton = document.querySelector("#template-change .change-save");
    changeButton.textContent = i18n.notificationChangeSave;

    var closeButton = document.getElementById("close-button");
    closeButton.title = i18n.close;
    closeButton.setAttribute("aria-label", i18n.close);

    document.querySelector("#template-add .add-text").textContent = i18n.notificationAddDesc;
    document.querySelector("#template-change .change-text").textContent =
      i18n.notificationChangeDesc;

    if (getQueryVariable("type") === "add") {
      handleTypeAdd(isVaultLocked);
    } else if (getQueryVariable("type") === "change") {
      handleTypeChange();
    }

    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      sendPlatformMessage({
        command: "bgCloseNotificationBar",
      });
    });

    window.addEventListener("resize", adjustHeight);
    adjustHeight();
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] === variable) {
        return pair[1];
      }
    }

    return null;
  }

  function handleTypeAdd(isVaultLocked) {
    setContent(document.getElementById("template-add"));

    var addButton = document.querySelector("#template-add-clone .add-save"), // eslint-disable-line
      neverButton = document.querySelector("#template-add-clone .never-save"); // eslint-disable-line

    addButton.addEventListener("click", (e) => {
      e.preventDefault();

      const folderId = document.querySelector("#template-add-clone .select-folder").value;

      const bgAddSaveMessage = {
        command: "bgAddSave",
        folder: folderId,
      };
      sendPlatformMessage(bgAddSaveMessage);
    });

    neverButton.addEventListener("click", (e) => {
      e.preventDefault();
      sendPlatformMessage({
        command: "bgNeverSave",
      });
    });

    if (!isVaultLocked) {
      const responseFoldersCommand = "notificationBarGetFoldersList";
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.command === responseFoldersCommand && msg.data) {
          fillSelectorWithFolders(msg.data.folders);
        }
      });
      sendPlatformMessage({
        command: "bgGetDataForTab",
        responseCommand: responseFoldersCommand,
      });
    }
  }

  function handleTypeChange() {
    setContent(document.getElementById("template-change"));
    var changeButton = document.querySelector("#template-change-clone .change-save"); // eslint-disable-line
    changeButton.addEventListener("click", (e) => {
      e.preventDefault();

      const bgChangeSaveMessage = {
        command: "bgChangeSave",
      };
      sendPlatformMessage(bgChangeSaveMessage);
    });
  }

  function setContent(element) {
    const content = document.getElementById("content");
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    var newElement = element.cloneNode(true);
    newElement.id = newElement.id + "-clone";
    content.appendChild(newElement);
  }

  function sendPlatformMessage(msg) {
    chrome.runtime.sendMessage(msg);
  }

  function fillSelectorWithFolders(folders) {
    const select = document.querySelector("#template-add-clone .select-folder");
    select.appendChild(new Option(chrome.i18n.getMessage("selectFolder"), null, true));
    folders.forEach((folder) => {
      //Select "No Folder" (id=null) folder by default
      select.appendChild(new Option(folder.name, folder.id || "", false));
    });
  }

  function adjustHeight() {
    sendPlatformMessage({
      command: "bgAdjustNotificationBar",
      data: {
        height: document.querySelector("body").scrollHeight,
      },
    });
  }
});
