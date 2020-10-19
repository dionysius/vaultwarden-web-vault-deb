import { CryptoService } from 'jslib/abstractions/crypto.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { Utils } from 'jslib/misc/utils';
import { SymmetricCryptoKey } from 'jslib/models/domain';
import { ConstantsService } from 'jslib/services';
import { BrowserApi } from '../browser/browserApi';
import RuntimeBackground from './runtime.background';
import { UserService } from 'jslib/abstractions/user.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

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
        private runtimeBackground: RuntimeBackground, private i18nService: I18nService, private userService: UserService,
        private messagingService: MessagingService) {}

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
                    this.cryptoService.setKey(new SymmetricCryptoKey(Utils.fromB64ToArray(message.keyB64).buffer));
                    this.vaultTimeoutService.biometricLocked = false;
                    this.runtimeBackground.processMessage({command: 'unlocked'}, null, null);
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
        const fingerprint = (await this.cryptoService.getFingerprint(await this.userService.getUserId(), this.publicKey)).join(' ');

        this.messagingService.send('showDialog', {
            html: `${this.i18nService.t('desktopIntegrationVerificationText')}<br><br><strong>${fingerprint}</strong>.`,
            title: this.i18nService.t('desktopSyncVerificationTitle'),
            confirmText: this.i18nService.t('ok'),
            type: 'warning',
        });

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
