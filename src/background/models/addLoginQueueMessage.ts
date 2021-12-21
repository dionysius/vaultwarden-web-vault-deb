import NotificationQueueMessage from "./notificationQueueMessage";

export default class AddLoginQueueMessage extends NotificationQueueMessage {
  username: string;
  password: string;
  uri: string;
}
