import { SaveOrUpdateCipherResult } from "../../background/abstractions/notification.background";

type NotificationBarWindowMessage = {
  [key: string]: any;
  command: string;
};

type NotificationBarWindowMessageHandlers = {
  [key: string]: CallableFunction;
  saveCipherAttemptCompleted: ({ message }: { message: SaveOrUpdateCipherResult }) => void;
};

export { NotificationBarWindowMessage, NotificationBarWindowMessageHandlers };
