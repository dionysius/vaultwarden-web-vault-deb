import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

import { BrowserApi } from "../browser/browser-api";

export default class BrowserMessagingService implements MessagingService {
  send(subscriber: string, arg: any = {}) {
    return BrowserApi.sendMessage(subscriber, arg);
  }
}
