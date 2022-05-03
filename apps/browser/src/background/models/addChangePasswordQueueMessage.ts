import NotificationQueueMessage from "./notificationQueueMessage";

export default class AddChangePasswordQueueMessage extends NotificationQueueMessage {
  cipherId: string;
  newPassword: string;
}
