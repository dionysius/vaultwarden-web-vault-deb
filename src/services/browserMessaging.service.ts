import { BrowserApi } from '../browser/browserApi';

import { MessagingService } from 'jslib/abstractions';

export default class BrowserMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);

        if (BrowserApi.isSafariApi) {
            BrowserApi.sendSafariMessageToApp(message);
        } else {
            chrome.runtime.sendMessage(message);
        }
    }
}
