import NotificationQueueMessage from "./notification-queue-message";
import { NotificationQueueMessageType } from "./notification-queue-message-type";

export default class AddUnlockVaultQueueMessage extends NotificationQueueMessage {
  type: NotificationQueueMessageType.UnlockVault;
}
