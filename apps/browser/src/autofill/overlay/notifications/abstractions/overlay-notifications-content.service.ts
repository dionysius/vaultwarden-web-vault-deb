export type NotificationTypeData = {
  isVaultLocked?: boolean;
  theme?: string;
  removeIndividualVault?: boolean;
  importType?: string;
  launchTimestamp?: number;
};

export type NotificationsExtensionMessage = {
  command: string;
  data?: {
    type?: string;
    typeData?: NotificationTypeData;
    height?: number;
    error?: string;
    fadeOutNotification?: boolean;
  };
};

type OverlayNotificationsExtensionMessageParam = {
  message: NotificationsExtensionMessage;
};
type OverlayNotificationsExtensionSenderParam = {
  sender: chrome.runtime.MessageSender;
};
export type OverlayNotificationsExtensionMessageParams = OverlayNotificationsExtensionMessageParam &
  OverlayNotificationsExtensionSenderParam;

export type OverlayNotificationsExtensionMessageHandlers = {
  [key: string]: ({ message, sender }: OverlayNotificationsExtensionMessageParams) => any;
  openNotificationBar: ({ message }: OverlayNotificationsExtensionMessageParam) => void;
  closeNotificationBar: ({ message }: OverlayNotificationsExtensionMessageParam) => void;
  adjustNotificationBar: ({ message }: OverlayNotificationsExtensionMessageParam) => void;
  saveCipherAttemptCompleted: ({ message }: OverlayNotificationsExtensionMessageParam) => void;
};

export interface OverlayNotificationsContentService {
  messageHandlers: OverlayNotificationsExtensionMessageHandlers;
  destroy: () => void;
}
