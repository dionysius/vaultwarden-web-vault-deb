type LpFilelessImporterMessage = {
  command?: string;
  data?: string;
  filelessImportEnabled?: boolean;
};

type LpFilelessImporterMessageHandlerParams = {
  message: LpFilelessImporterMessage;
  port: chrome.runtime.Port;
};

type LpFilelessImporterMessageHandlers = {
  [key: string]: ({ message, port }: LpFilelessImporterMessageHandlerParams) => void;
  verifyFeatureFlag: ({ message }: { message: LpFilelessImporterMessage }) => void;
  triggerCsvDownload: () => void;
  startLpFilelessImport: () => void;
};

interface LpFilelessImporter {
  init(): void;
  handleFeatureFlagVerification(message: LpFilelessImporterMessage): void;
  triggerCsvDownload(): void;
}

export { LpFilelessImporterMessage, LpFilelessImporterMessageHandlers, LpFilelessImporter };
