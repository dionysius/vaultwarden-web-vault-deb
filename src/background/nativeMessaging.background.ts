import { CryptoService, VaultTimeoutService } from 'jslib/abstractions';
import { StorageService } from 'jslib/abstractions/storage.service';
import { ConstantsService } from 'jslib/services';
import { BrowserApi } from '../browser/browserApi';
import RuntimeBackground from './runtime.background';

export class NativeMessagingBackground {
    private connected = false;
    private port: browser.runtime.Port | chrome.runtime.Port;

    private resolver: any = null;

    constructor(private storageService: StorageService, private cryptoService: CryptoService,
        private vaultTimeoutService: VaultTimeoutService, private runtimeBackground: RuntimeBackground) {}

    connect() {
        this.port = BrowserApi.connectNative('com.8bit.bitwarden');

        this.connected = true;

        this.port.onMessage.addListener((msg) => this.onMessage(msg));
        
        this.port.onDisconnect.addListener(() => {
            this.connected = false;
        });
    }

    async send(message: any) {
        // If not connected, try to connect
        if (!this.connected) {
            this.connect();
        }

        message.timestamp = Date.now();

        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message));
        this.port.postMessage(encrypted);
    }

    await(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.resolver = resolve;
        });
    }

    private async onMessage(rawMessage: any) {
        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage));

        if (Math.abs(message.timestamp - Date.now()) > 10*1000) {
            console.error("MESSAGE IS TO OLD");
            return;
        }

        switch(message.command) {
            case 'biometricUnlock': {
                await this.storageService.remove(ConstantsService.biometricAwaitingAcceptance);

                const enabled = await this.storageService.get(ConstantsService.biometricUnlockKey);
                if (enabled === null || enabled === false) {
                    if (message.response === 'unlocked') {
                        await this.storageService.save(ConstantsService.biometricUnlockKey, true);
                    }
    
                    await this.cryptoService.toggleKey();
                }

                if (this.vaultTimeoutService.biometricLocked) {
                    this.runtimeBackground.processMessage({command: 'unlocked'}, null, null);
                    this.vaultTimeoutService.biometricLocked = false;
                }
            }
        }

        if (this.resolver) {
            this.resolver(message);
        }
    }
}
