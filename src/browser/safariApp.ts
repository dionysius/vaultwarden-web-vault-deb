import { BrowserApi } from './browserApi';

export class SafariApp {
    static inited = false;

    static init() {
        if (SafariApp.inited) {
            return;
        }
        SafariApp.inited = true;
        if (BrowserApi.isSafariApi) {
            (window as any).bitwardenSafariAppRequests =
                new Map<string, { resolve: (value?: unknown) => void, timeoutDate: Date }>();
            (window as any).bitwardenSafariAppMessageListeners =
                new Map<string, (message: any, sender: any, response: any) => void>();
            (window as any).bitwardenSafariAppMessageReceiver = (message: any) => {
                SafariApp.receiveMessageFromApp(message);
            };
            setInterval(() => SafariApp.cleanupOldRequests(), 5 * 60000);
        }
    }

    static sendMessageToApp(command: string, data: any = null, resolveNow = false): Promise<any> {
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
            if (resolveNow) {
                resolve();
            } else {
                (window as any).bitwardenSafariAppRequests.set(messageId, {
                    resolve: resolve,
                    timeoutDate: new Date(now.getTime() + 5 * 60000),
                });
            }
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
        if ((message.id == null || message.id === '') && message.command === 'app_message') {
            try {
                const msg = JSON.parse(message.data);
                SafariApp.sendMessageToListeners(msg, 'app_message', null);
            } catch { }
        } else if (message.id != null && (window as any).bitwardenSafariAppRequests.has(message.id)) {
            const p = (window as any).bitwardenSafariAppRequests.get(message.id);
            p.resolve(message.responseData);
            (window as any).bitwardenSafariAppRequests.delete(message.id);
        }
    }

    private static cleanupOldRequests() {
        const remoteIds: string[] = [];
        ((window as any).bitwardenSafariAppRequests as
            Map<string, { resolve: (value?: unknown) => void, timeoutDate: Date }>)
            .forEach((v, key) => {
                if (v.timeoutDate < new Date()) {
                    remoteIds.push(key);
                }
            });
        remoteIds.forEach((id) => {
            (window as any).bitwardenSafariAppRequests.delete(id);
        });
    }
}
