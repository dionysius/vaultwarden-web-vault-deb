enum NotificationQueueMessageType {
  AddLogin = 0,
  ChangePassword = 1,
  UnlockVault = 2,
  RequestFilelessImport = 3,
}

const NotificationTypes = {
  [NotificationQueueMessageType.AddLogin]: "add",
  [NotificationQueueMessageType.ChangePassword]: "change",
  [NotificationQueueMessageType.UnlockVault]: "unlock",
  [NotificationQueueMessageType.RequestFilelessImport]: "fileless-import",
} as const;

export { NotificationQueueMessageType, NotificationTypes };
