import { BrowserApi } from './browserApi';

export class SafariApp {
    static init() {
        if (BrowserApi.isSafariApi) {
            (window as any).bitwardenSafariAppMessageReceiver = (message: any) =>
                SafariApp.receiveMessageFromApp(message);
        }
    }

    static sendMessageToApp(command: string, data: any = null): Promise<any> {
        if (!BrowserApi.isSafariApi) {
            return Promise.resolve(null);
        }
        return new Promise((resolve) => {
            const messageId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            (window as any).webkit.messageHandlers.bitwardenApp.postMessage({
                id: messageId,
                command: command,
                data: data,
            });
            SafariApp.requests.set(messageId, { resolve: resolve, date: new Date() });
        });
    }

    private static requests = new Map<number, { resolve: (value?: unknown) => void, date: Date }>();

    private static receiveMessageFromApp(message: any) {
        if (message == null || message.id == null || !SafariApp.requests.has(message.id)) {
            return;
        }
        const p = SafariApp.requests.get(message.id);
        p.resolve(message.data);
    }
}
