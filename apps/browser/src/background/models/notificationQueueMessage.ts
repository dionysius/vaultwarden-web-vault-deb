import { NotificationQueueMessageType } from "./notificationQueueMessageType";

export default class NotificationQueueMessage {
  type: NotificationQueueMessageType;
  domain: string;
  tab: chrome.tabs.Tab;
  expires: Date;
  wasVaultLocked: boolean;
}
