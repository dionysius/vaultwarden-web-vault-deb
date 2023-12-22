import AddChangePasswordQueueMessage from "../../notification/models/add-change-password-queue-message";
import AddLoginQueueMessage from "../../notification/models/add-login-queue-message";
import AddRequestFilelessImportQueueMessage from "../../notification/models/add-request-fileless-import-queue-message";
import AddUnlockVaultQueueMessage from "../../notification/models/add-unlock-vault-queue-message";

type NotificationQueueMessageItem =
  | AddLoginQueueMessage
  | AddChangePasswordQueueMessage
  | AddUnlockVaultQueueMessage
  | AddRequestFilelessImportQueueMessage;

export { NotificationQueueMessageItem };
