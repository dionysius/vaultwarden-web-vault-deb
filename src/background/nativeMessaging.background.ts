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

    private async onMessage(msg: any) {
        switch(msg.command) {
            case 'biometricUnlock': {
                await this.storageService.remove(ConstantsService.biometricAwaitingAcceptance);

                const enabled = await this.storageService.get(ConstantsService.biometricUnlockKey);
                if (enabled === null || enabled === false) {
                    if (msg.response === 'unlocked') {
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
            this.resolver(msg);
        }
    }
}
