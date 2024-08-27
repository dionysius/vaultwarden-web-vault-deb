type NotificationBarIframeInitData = {
  type?: string;
  isVaultLocked?: boolean;
  theme?: string;
  removeIndividualVault?: boolean;
  importType?: string;
  applyRedesign?: boolean;
  launchTimestamp?: number;
};

type NotificationBarWindowMessage = {
  [key: string]: any;
  command: string;
  error?: string;
  initData?: NotificationBarIframeInitData;
};

type NotificationBarWindowMessageHandlers = {
  [key: string]: CallableFunction;
  initNotificationBar: ({ message }: { message: NotificationBarWindowMessage }) => void;
  saveCipherAttemptCompleted: ({ message }: { message: NotificationBarWindowMessage }) => void;
};

export {
  NotificationBarIframeInitData,
  NotificationBarWindowMessage,
  NotificationBarWindowMessageHandlers,
};
