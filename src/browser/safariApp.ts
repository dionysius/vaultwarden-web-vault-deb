import { BrowserApi } from './browserApi';

export class SafariApp {
    static init() {
        if ((window as any).bitwardenSafariAppInited) {
            return;
        }
        (window as any).bitwardenSafariAppInited = true;

        if (BrowserApi.isSafariApi) {
            (window as any).bitwardenSafariAppRequests =
                new Map<string, { resolve: (value?: unknown) => void, timeoutDate: Date }>();
            (window as any).bitwardenSafariAppMessageListeners =
                new Map<string, (message: any, sender: any, response: any) => void>();
            (window as any).bitwardenSafariAppMessageReceiver = (message: any) => {
                SafariApp.receiveMessageFromApp(message);
            };
        }
    }

    static sendMessageToApp(command: string, data: any = null, resolveNow = false): Promise<any> {
        debugger;
        if (!BrowserApi.isSafariApi) {
            return Promise.resolve(null);
        }
        return new Promise((resolve) => {
            const now = new Date();
            const messageId = now.getTime().toString() + '_' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            (browser as any).runtime.sendNativeMessage("com.bitwarden.desktop", {
                id: messageId,
                command: command,
                data: data,
                responseData: null,
            }, (response: any) => {
                resolve(response);
            });
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
                debugger;
                const msg = JSON.parse(message.data);
                SafariApp.sendMessageToListeners(msg, {
                    id: 'app_message',
                    tab: message.senderTab,
                }, null);
            } catch { }
        }
    }
}
