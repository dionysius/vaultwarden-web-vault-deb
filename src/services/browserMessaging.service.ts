import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

import { MessagingService } from 'jslib/abstractions/messaging.service';

export default class BrowserMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        if (BrowserApi.isSafariApi) {
            SafariApp.sendMessageToApp(subscriber, arg);
            SafariApp.sendMessageToListeners(message, 'BrowserMessagingService', null);
        } else {
            chrome.runtime.sendMessage(message);
        }
    }
}
