import { BrowserApi } from './browserApi';

export class SafariApp {
    static init() {
        if (BrowserApi.isSafariApi) {
            (window as any).bitwardenSafariAppMessageReceiver = (message: any) => {
                SafariApp.receiveMessageFromApp(message);
            };
        }
    }

    static sendMessageToApp(command: string, data: any = null): Promise<any> {
        if (!BrowserApi.isSafariApi) {
            return Promise.resolve(null);
        }
        return new Promise((resolve) => {
            const now = new Date();
            const messageId = now.getTime().toString() + '_' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            (window as any).webkit.messageHandlers.bitwardenApp.postMessage(JSON.stringify({
                id: messageId,
                command: command,
                data: data,
                responseData: null,
            }));
            SafariApp.requests.set(messageId, { resolve: resolve, date: now });
        });
    }

    static addMessageListener(name: string, callback: (message: any, sender: any, response: any) => void) {
        SafariApp.messageListeners.set(name, callback);
    }

    static sendMessageToListeners(message: any, sender: any, response: any) {
        SafariApp.messageListeners.forEach((f) => f(message, sender, response));
    }

    private static requests = new Map<string, { resolve: (value?: unknown) => void, date: Date }>();
    private static messageListeners = new Map<string, (message: any, sender: any, response: any) => void>();

    private static receiveMessageFromApp(message: any) {
        if (message == null || message.id == null || !SafariApp.requests.has(message.id)) {
            return;
        }
        const p = SafariApp.requests.get(message.id);
        p.resolve(message.responseData);
    }
}
