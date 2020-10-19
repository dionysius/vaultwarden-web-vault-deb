import { CryptoService, LogService, VaultTimeoutService } from 'jslib/abstractions';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { Utils } from 'jslib/misc/utils';
import { SymmetricCryptoKey } from 'jslib/models/domain';
import { ConstantsService } from 'jslib/services';
import { BrowserApi } from '../browser/browserApi';
import RuntimeBackground from './runtime.background';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha1';

export class NativeMessagingBackground {
    private connected = false;
    private port: browser.runtime.Port | chrome.runtime.Port;

    private resolver: any = null;
    private publicKey: ArrayBuffer;
    private privateKey: ArrayBuffer = null;
    private secureSetupResolve: any = null;
    private sharedSecret: SymmetricCryptoKey;

    constructor(private storageService: StorageService, private cryptoService: CryptoService,
        private cryptoFunctionService: CryptoFunctionService, private vaultTimeoutService: VaultTimeoutService,
        private runtimeBackground: RuntimeBackground) {}

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

        if (this.sharedSecret == null) {
            await this.secureCommunication();
        }

        message.timestamp = Date.now();

        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message), this.sharedSecret);
        this.port.postMessage(encrypted);
    }

    await(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.resolver = resolve;
        });
    }

    private async onMessage(rawMessage: any) {
        if (rawMessage.command === 'setupEncryption') {
            const encrypted = Utils.fromB64ToArray(rawMessage.sharedSecret);
            const decrypted = await this.cryptoFunctionService.rsaDecrypt(encrypted.buffer, this.privateKey, EncryptionAlgorithm);

            this.sharedSecret = new SymmetricCryptoKey(decrypted);
            this.secureSetupResolve();
            return;
        }
        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage, this.sharedSecret));

        if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
            // tslint:disable-next-line
            console.error('NativeMessage is to old, ignoring.');
            return;
        }

        switch (message.command) {
            case 'biometricUnlock':
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
                break;
            default:
                // tslint:disable-next-line
                console.error('NativeMessage, got unknown command.');
        }

        if (this.resolver) {
            this.resolver(message);
        }
    }

    private async secureCommunication() {
        // Using crypto function service directly since we cannot encrypt the private key as
        // master key might not be available
        [this.publicKey, this.privateKey] = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);

        this.sendUnencrypted({command: 'setupEncryption', publicKey: Utils.fromBufferToB64(this.publicKey)});

        return new Promise((resolve, reject) => this.secureSetupResolve = resolve);
    }

    private async sendUnencrypted(message: any) {
        if (!this.connected) {
            this.connect();
        }

        message.timestamp = Date.now();

        this.port.postMessage(message);
    }
}
