import NotificationQueueMessage from "./notification-queue-message";
import { NotificationQueueMessageType } from "./notification-queue-message-type";

export default class AddChangePasswordQueueMessage extends NotificationQueueMessage {
  type: NotificationQueueMessageType.ChangePassword;
  cipherId: string;
  newPassword: string;
}
