import { MessagingService } from 'jslib-common/abstractions/messaging.service';

export default class BrowserMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
