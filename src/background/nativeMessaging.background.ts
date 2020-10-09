import { BrowserApi } from "../browser/browserApi";

export class NativeMessagingBackground {
    private connected = false;
    private port: browser.runtime.Port | chrome.runtime.Port;

    private resolver: any = null;

    connect() {
        this.port = BrowserApi.connectNative("com.8bit.bitwarden");

        this.connected = true;
        this.port.onMessage.addListener((msg: any) => {
            if (this.resolver) {
                this.resolver(msg);
            } else {
                console.error('NO RESOLVER');
            }
        });
        this.port.onDisconnect.addListener(() => {
            this.connected = false;
            console.log('Disconnected');
        });
    }

    send(message: object) {
        // If not connected, try to connect
        if (!this.connected) {
            this.connect();
        }

        this.port.postMessage(message);
    }

    await(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.resolver = resolve;
        });
    }
}
