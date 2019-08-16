import { BrowserApi } from './browserApi';

export class SafariApp {
    static init() {
        if (BrowserApi.isSafariApi) {
            (window as any).bitwardenSafariAppRequests =
                new Map<string, { resolve: (value?: unknown) => void, date: Date }>();
            (window as any).bitwardenSafariAppMessageListeners =
                new Map<string, { resolve: (value?: unknown) => void, date: Date }>();
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
            (window as any).bitwardenSafariAppRequests.set(messageId, { resolve: resolve, date: now });
        });
    }

    static addMessageListener(name: string, callback: (message: any, sender: any, response: any) => void) {
        (window as any).bitwardenSafariAppMessageListeners.set(name, callback);
    }

    static sendMessageToListeners(message: any, sender: any, response: any) {
        (window as any).bitwardenSafariAppMessageListeners.forEach((f: any) => f(message, sender, response));
    }

    private static receiveMessageFromApp(message: any) {
        if (message == null) {
            return;
        }
        if (message.id == null && message.command === 'cs_message') {
            try {
                const msg = JSON.parse(message.data);
                SafariApp.sendMessageToListeners(msg, 'cs_message', null);
            } catch { }
        } else if (message.id != null && (window as any).bitwardenSafariAppRequests.has(message.id)) {
            const p = (window as any).bitwardenSafariAppRequests.get(message.id);
            p.resolve(message.responseData);
        }
    }
}
