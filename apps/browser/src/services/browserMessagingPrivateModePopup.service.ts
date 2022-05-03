import { MessagingService } from "jslib-common/abstractions/messaging.service";

export default class BrowserMessagingPrivateModePopupService implements MessagingService {
  send(subscriber: string, arg: any = {}) {
    const message = Object.assign({}, { command: subscriber }, arg);
    (window as any).bitwardenBackgroundMessageListener(message);
  }
}
