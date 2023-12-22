import NotificationQueueMessage from "./notification-queue-message";
import { NotificationQueueMessageType } from "./notification-queue-message-type";

export default class AddRequestFilelessImportQueueMessage extends NotificationQueueMessage {
  type: NotificationQueueMessageType.RequestFilelessImport;
  importType?: string;
}
