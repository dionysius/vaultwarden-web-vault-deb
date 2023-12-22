import type { Jsonify } from "type-fest";

import { ConsoleLogService } from "@bitwarden/common/platform/services/console-log.service";
import type { FolderView } from "@bitwarden/common/vault/models/view/folder.view";

import { FilelessImportPort, FilelessImportType } from "../../tools/enums/fileless-import.enums";

require("./bar.scss");

const logService = new ConsoleLogService(false);

document.addEventListener("DOMContentLoaded", () => {
  // delay 50ms so that we get proper body dimensions
  setTimeout(load, 50);
});

function load() {
  const theme = getQueryVariable("theme");
  document.documentElement.classList.add("theme_" + theme);

  const isVaultLocked = getQueryVariable("isVaultLocked") == "true";
  (document.getElementById("logo") as HTMLImageElement).src = isVaultLocked
    ? chrome.runtime.getURL("images/icon38_locked.png")
    : chrome.runtime.getURL("images/icon38.png");

  const i18n = {
    appName: chrome.i18n.getMessage("appName"),
    close: chrome.i18n.getMessage("close"),
    never: chrome.i18n.getMessage("never"),
    folder: chrome.i18n.getMessage("folder"),
    notificationAddSave: chrome.i18n.getMessage("notificationAddSave"),
    notificationAddDesc: chrome.i18n.getMessage("notificationAddDesc"),
    notificationEdit: chrome.i18n.getMessage("edit"),
    notificationChangeSave: chrome.i18n.getMessage("notificationChangeSave"),
    notificationChangeDesc: chrome.i18n.getMessage("notificationChangeDesc"),
    notificationUnlock: chrome.i18n.getMessage("notificationUnlock"),
    notificationUnlockDesc: chrome.i18n.getMessage("notificationUnlockDesc"),
    filelessImport: chrome.i18n.getMessage("filelessImport"),
    lpFilelessImport: chrome.i18n.getMessage("lpFilelessImport"),
    cancelFilelessImport: chrome.i18n.getMessage("no"),
    lpCancelFilelessImport: chrome.i18n.getMessage("lpCancelFilelessImport"),
    startFilelessImport: chrome.i18n.getMessage("startFilelessImport"),
  };

  const logoLink = document.getElementById("logo-link") as HTMLAnchorElement;
  logoLink.title = i18n.appName;

  // Update logo link to user's regional domain
  const webVaultURL = getQueryVariable("webVaultURL");
  const newVaultURL = webVaultURL && decodeURIComponent(webVaultURL);

  if (newVaultURL && newVaultURL !== logoLink.href) {
    logoLink.href = newVaultURL;
  }

  // i18n for "Add" template
  const addTemplate = document.getElementById("template-add") as HTMLTemplateElement;

  const neverButton = addTemplate.content.getElementById("never-save");
  neverButton.textContent = i18n.never;

  const selectFolder = addTemplate.content.getElementById("select-folder");
  selectFolder.hidden = isVaultLocked || removeIndividualVault();
  selectFolder.setAttribute("aria-label", i18n.folder);

  const addButton = addTemplate.content.getElementById("add-save");
  addButton.textContent = i18n.notificationAddSave;

  const addEditButton = addTemplate.content.getElementById("add-edit");
  // If Remove Individual Vault policy applies, "Add" opens the edit tab, so we hide the Edit button
  addEditButton.hidden = removeIndividualVault();
  addEditButton.textContent = i18n.notificationEdit;

  addTemplate.content.getElementById("add-text").textContent = i18n.notificationAddDesc;

  // i18n for "Change" (update password) template
  const changeTemplate = document.getElementById("template-change") as HTMLTemplateElement;

  const changeButton = changeTemplate.content.getElementById("change-save");
  changeButton.textContent = i18n.notificationChangeSave;

  const changeEditButton = changeTemplate.content.getElementById("change-edit");
  changeEditButton.textContent = i18n.notificationEdit;

  changeTemplate.content.getElementById("change-text").textContent = i18n.notificationChangeDesc;

  // i18n for "Unlock" (unlock extension) template
  const unlockTemplate = document.getElementById("template-unlock") as HTMLTemplateElement;

  const unlockButton = unlockTemplate.content.getElementById("unlock-vault");
  unlockButton.textContent = i18n.notificationUnlock;

  unlockTemplate.content.getElementById("unlock-text").textContent = i18n.notificationUnlockDesc;

  // i18n for "Fileless Import" (fileless-import) template
  const isLpImport = getQueryVariable("importType") === FilelessImportType.LP;
  const importTemplate = document.getElementById("template-fileless-import") as HTMLTemplateElement;

  const startImportButton = importTemplate.content.getElementById("start-fileless-import");
  startImportButton.textContent = i18n.startFilelessImport;

  const cancelImportButton = importTemplate.content.getElementById("cancel-fileless-import");
  cancelImportButton.textContent = isLpImport
    ? i18n.lpCancelFilelessImport
    : i18n.cancelFilelessImport;

  importTemplate.content.getElementById("fileless-import-text").textContent = isLpImport
    ? i18n.lpFilelessImport
    : i18n.filelessImport;

  // i18n for body content
  const closeButton = document.getElementById("close-button");
  closeButton.title = i18n.close;

  if (getQueryVariable("type") === "add") {
    handleTypeAdd();
  } else if (getQueryVariable("type") === "change") {
    handleTypeChange();
  } else if (getQueryVariable("type") === "unlock") {
    handleTypeUnlock();
  } else if (getQueryVariable("type") === "fileless-import") {
    handleTypeFilelessImport();
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

function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");

  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }

  return null;
}

function handleTypeAdd() {
  setContent(document.getElementById("template-add") as HTMLTemplateElement);

  const addButton = document.getElementById("add-save");
  addButton.addEventListener("click", (e) => {
    e.preventDefault();

    // If Remove Individual Vault policy applies, "Add" opens the edit tab
    sendPlatformMessage({
      command: "bgAddSave",
      folder: getSelectedFolder(),
      edit: removeIndividualVault(),
    });
  });

  if (removeIndividualVault()) {
    // Everything past this point is only required if user has an individual vault
    return;
  }

  const editButton = document.getElementById("add-edit");
  editButton.addEventListener("click", (e) => {
    e.preventDefault();

    sendPlatformMessage({
      command: "bgAddSave",
      folder: getSelectedFolder(),
      edit: true,
    });
  });

  const neverButton = document.getElementById("never-save");
  neverButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendPlatformMessage({
      command: "bgNeverSave",
    });
  });

  loadFolderSelector();
}

function handleTypeChange() {
  setContent(document.getElementById("template-change") as HTMLTemplateElement);
  const changeButton = document.getElementById("change-save");
  changeButton.addEventListener("click", (e) => {
    e.preventDefault();

    sendPlatformMessage({
      command: "bgChangeSave",
      edit: false,
    });
  });

  const editButton = document.getElementById("change-edit");
  editButton.addEventListener("click", (e) => {
    e.preventDefault();

    sendPlatformMessage({
      command: "bgChangeSave",
      edit: true,
    });
  });
}

function handleTypeUnlock() {
  setContent(document.getElementById("template-unlock") as HTMLTemplateElement);

  const unlockButton = document.getElementById("unlock-vault");
  unlockButton.addEventListener("click", (e) => {
    sendPlatformMessage({
      command: "bgReopenUnlockPopout",
    });
  });
}

/**
 * Sets up a port to communicate with the fileless importer content script.
 * This connection to the background script is used to trigger the action of
 * downloading the CSV file from the LP importer or importing the data into
 * the Bitwarden vault.
 */
function handleTypeFilelessImport() {
  const importType = getQueryVariable("importType");
  const port = chrome.runtime.connect({ name: FilelessImportPort.NotificationBar });
  setContent(document.getElementById("template-fileless-import") as HTMLTemplateElement);

  const startFilelessImportButton = document.getElementById("start-fileless-import");
  const startFilelessImport = () => {
    port.postMessage({ command: "startFilelessImport", importType });
    document.getElementById("fileless-import-buttons").textContent =
      chrome.i18n.getMessage("importing");
    startFilelessImportButton.removeEventListener("click", startFilelessImport);
  };
  startFilelessImportButton.addEventListener("click", startFilelessImport);

  const cancelFilelessImportButton = document.getElementById("cancel-fileless-import");
  cancelFilelessImportButton.addEventListener("click", () => {
    port.postMessage({ command: "cancelFilelessImport", importType });
  });

  const handlePortMessage = (msg: any) => {
    if (msg.command !== "filelessImportCompleted" && msg.command !== "filelessImportFailed") {
      return;
    }

    port.disconnect();

    if (msg.command === "filelessImportCompleted") {
      document.getElementById("fileless-import-buttons").textContent = chrome.i18n.getMessage(
        "dataSuccessfullyImported",
      );
      document.getElementById("fileless-import-buttons").classList.add("success-message");
      return;
    }

    document.getElementById("fileless-import-buttons").textContent =
      chrome.i18n.getMessage("dataImportFailed");
    document.getElementById("fileless-import-buttons").classList.add("error-message");
    logService.error(`Error Encountered During Import: ${msg.importErrorMessage}`);
  };
  port.onMessage.addListener(handlePortMessage);
}

function setContent(template: HTMLTemplateElement) {
  const content = document.getElementById("content");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  const newElement = template.content.cloneNode(true) as HTMLElement;
  content.appendChild(newElement);
}

function sendPlatformMessage(msg: Record<string, unknown>) {
  chrome.runtime.sendMessage(msg);
}

function loadFolderSelector() {
  const responseFoldersCommand = "notificationBarGetFoldersList";

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.command !== responseFoldersCommand || msg.data == null) {
      return;
    }

    const folders = msg.data.folders as Jsonify<FolderView[]>;
    const select = document.getElementById("select-folder");
    select.appendChild(new Option(chrome.i18n.getMessage("selectFolder"), null, true));
    folders.forEach((folder) => {
      // Select "No Folder" (id=null) folder by default
      select.appendChild(new Option(folder.name, folder.id || "", false));
    });
  });

  sendPlatformMessage({
    command: "bgGetDataForTab",
    responseCommand: responseFoldersCommand,
  });
}

function getSelectedFolder(): string {
  return (document.getElementById("select-folder") as HTMLSelectElement).value;
}

function removeIndividualVault(): boolean {
  return getQueryVariable("removeIndividualVault") == "true";
}

function adjustHeight() {
  sendPlatformMessage({
    command: "bgAdjustNotificationBar",
    data: {
      height: document.querySelector("body").scrollHeight,
    },
  });
}
