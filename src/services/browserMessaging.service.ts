import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

import { MessagingService } from 'jslib/abstractions/messaging.service';

export default class BrowserMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        if (BrowserApi.isSafariApi) {
            SafariApp.sendMessageToApp(subscriber, arg);
        } else {
            const message = Object.assign({}, { command: subscriber }, arg);
            chrome.runtime.sendMessage(message);
        }
    }
}
