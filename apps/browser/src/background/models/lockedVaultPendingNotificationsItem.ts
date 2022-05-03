export default class LockedVaultPendingNotificationsItem {
  commandToRetry: {
    msg: any;
    sender: chrome.runtime.MessageSender;
  };
  target: string;
}
