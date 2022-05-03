import { NotificationQueueMessageType } from "./notificationQueueMessageType";

export default class NotificationQueueMessage {
  type: NotificationQueueMessageType;
  domain: string;
  tabId: number;
  expires: Date;
  wasVaultLocked: boolean;
}
