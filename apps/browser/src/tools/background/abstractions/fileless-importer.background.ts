import { FilelessImportTypeKeys } from "../../enums/fileless-import.enums";

type FilelessImportPortMessage = {
  command?: string;
  importType?: FilelessImportTypeKeys;
  data?: string;
};

type FilelessImportPortMessageHandlerParams = {
  message: FilelessImportPortMessage;
  port: chrome.runtime.Port;
};

type ImportNotificationMessageHandlers = {
  [key: string]: ({ message, port }: FilelessImportPortMessageHandlerParams) => void;
  cancelFilelessImport: ({ message, port }: FilelessImportPortMessageHandlerParams) => void;
};

type LpImporterMessageHandlers = {
  [key: string]: ({ message, port }: FilelessImportPortMessageHandlerParams) => void;
  displayLpImportNotification: ({ port }: { port: chrome.runtime.Port }) => void;
  startLpImport: ({ message }: { message: FilelessImportPortMessage }) => void;
};

interface FilelessImporterBackground {
  init(): void;
}

export {
  FilelessImportPortMessage,
  ImportNotificationMessageHandlers,
  LpImporterMessageHandlers,
  FilelessImporterBackground,
};
