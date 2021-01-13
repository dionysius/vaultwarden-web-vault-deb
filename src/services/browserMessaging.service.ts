import { MessagingService } from 'jslib/abstractions/messaging.service';

export default class BrowserMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
