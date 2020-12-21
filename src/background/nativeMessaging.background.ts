import { ConstantsService } from 'jslib/services/constants.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { Utils } from 'jslib/misc/utils';
import { SymmetricCryptoKey } from 'jslib/models/domain';

import { BrowserApi } from '../browser/browserApi';
import RuntimeBackground from './runtime.background';

const MessageValidTimeout = 10 * 1000;
const EncryptionAlgorithm = 'sha1';

export class NativeMessagingBackground {
    private connected = false;
    private connecting: boolean;
    private port: browser.runtime.Port | chrome.runtime.Port;

    private resolver: any = null;
    private privateKey: ArrayBuffer = null;
    private publicKey: ArrayBuffer = null;
    private secureSetupResolve: any = null;
    private sharedSecret: SymmetricCryptoKey;
    private appId: string;

    constructor(private storageService: StorageService, private cryptoService: CryptoService,
        private cryptoFunctionService: CryptoFunctionService, private vaultTimeoutService: VaultTimeoutService,
        private runtimeBackground: RuntimeBackground, private i18nService: I18nService, private userService: UserService,
        private messagingService: MessagingService, private appIdService: AppIdService) {}

    async connect() {
        this.appId = await this.appIdService.getAppId();

        return new Promise((resolve, reject) => {
            this.port = BrowserApi.connectNative('com.8bit.bitwarden');

            this.connecting = true;

            this.port.onMessage.addListener(async (message: any) => {
                switch (message.command) {
                    case 'connected':
                        this.connected = true;
                        this.connecting = false;
                        resolve();
                        break;
                    case 'disconnected':
                        if (this.connecting) {
                            this.messagingService.send('showDialog', {
                                text: this.i18nService.t('startDesktopDesc'),
                                title: this.i18nService.t('startDesktopTitle'),
                                confirmText: this.i18nService.t('ok'),
                                type: 'error',
                            });
                            reject();
                        }
                        this.connected = false;
                        this.port.disconnect();
                        break;
                    case 'setupEncryption':
                        // Ignore since it belongs to another device
                        if (message.appId !== this.appId) {
                            return;
                        }

                        const encrypted = Utils.fromB64ToArray(message.sharedSecret);
                        const decrypted = await this.cryptoFunctionService.rsaDecrypt(encrypted.buffer, this.privateKey, EncryptionAlgorithm);

                        this.sharedSecret = new SymmetricCryptoKey(decrypted);
                        this.secureSetupResolve();
                        break;
                    case 'invalidateEncryption':
                        // Ignore since it belongs to another device
                        if (message.appId !== this.appId) {
                            return;
                        }

                        this.sharedSecret = null;
                        this.privateKey = null;
                        this.connected = false;

                        this.messagingService.send('showDialog', {
                            text: this.i18nService.t('nativeMessagingInvalidEncryptionDesc'),
                            title: this.i18nService.t('nativeMessagingInvalidEncryptionTitle'),
                            confirmText: this.i18nService.t('ok'),
                            type: 'error',
                        });
                        break;
                    case 'verifyFingerprint': {
                        if (this.sharedSecret == null) {
                            this.showFingerprintDialog();
                        }
                        break;
                    }
                    default:
                        // Ignore since it belongs to another device
                        if (message.appId !== this.appId) {
                            return;
                        }

                        this.onMessage(message.message);
                }
            });

            this.port.onDisconnect.addListener((p: any) => {
                let error;
                if (BrowserApi.isWebExtensionsApi) {
                    error = p.error.message;
                } else {
                    error = chrome.runtime.lastError.message;
                }

                if (error === 'Specified native messaging host not found.' ||
                    error === 'Access to the specified native messaging host is forbidden.' ||
                    error === 'An unexpected error occurred') {
                    this.messagingService.send('showDialog', {
                        text: this.i18nService.t('desktopIntegrationDisabledDesc'),
                        title: this.i18nService.t('desktopIntegrationDisabledTitle'),
                        confirmText: this.i18nService.t('ok'),
                        type: 'error',
                    });
                }
                this.sharedSecret = null;
                this.privateKey = null;
                this.connected = false;
                reject();
            });
        });
    }

    async send(message: any) {
        if (!this.connected) {
            await this.connect();
        }

        if (this.sharedSecret == null) {
            await this.secureCommunication();
        }

        message.timestamp = Date.now();

        const encrypted = await this.cryptoService.encrypt(JSON.stringify(message), this.sharedSecret);
        this.port.postMessage({appId: this.appId, message: encrypted});
    }

    getResponse(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.resolver = resolve;
        });
    }

    private async onMessage(rawMessage: any) {
        const message = JSON.parse(await this.cryptoService.decryptToUtf8(rawMessage, this.sharedSecret));

        if (Math.abs(message.timestamp - Date.now()) > MessageValidTimeout) {
            // tslint:disable-next-line
            console.error('NativeMessage is to old, ignoring.');
            return;
        }

        switch (message.command) {
            case 'biometricUnlock':
                await this.storageService.remove(ConstantsService.biometricAwaitingAcceptance);

                if (message.response === 'not enabled') {
                    this.messagingService.send('showDialog', {
                        text: this.i18nService.t('biometricsNotEnabledDesc'),
                        title: this.i18nService.t('biometricsNotEnabledTitle'),
                        confirmText: this.i18nService.t('ok'),
                        type: 'error',
                    });
                    break;
                } else if (message.response === 'not supported') {
                    this.messagingService.send('showDialog', {
                        text: this.i18nService.t('biometricsNotSupportedDesc'),
                        title: this.i18nService.t('biometricsNotSupportedTitle'),
                        confirmText: this.i18nService.t('ok'),
                        type: 'error',
                    });
                    break;
                }

                const enabled = await this.storageService.get(ConstantsService.biometricUnlockKey);
                if (enabled === null || enabled === false) {
                    if (message.response === 'unlocked') {
                        await this.storageService.save(ConstantsService.biometricUnlockKey, true);
                    }
                    break;
                }

                // Ignore unlock if already unlockeded
                if (!this.vaultTimeoutService.biometricLocked) {
                    break;
                }

                if (message.response === 'unlocked') {
                    this.cryptoService.setKey(new SymmetricCryptoKey(Utils.fromB64ToArray(message.keyB64).buffer));
                    this.vaultTimeoutService.biometricLocked = false;
                    this.runtimeBackground.processMessage({command: 'unlocked'}, null, null);
                }
                break;
            default:
                // tslint:disable-next-line
                console.error('NativeMessage, got unknown command: ', message.command);
        }

        if (this.resolver) {
            this.resolver(message);
        }
    }

    private async secureCommunication() {
        const [publicKey, privateKey] = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);
        this.publicKey = publicKey;
        this.privateKey = privateKey;

        this.sendUnencrypted({command: 'setupEncryption', publicKey: Utils.fromBufferToB64(publicKey)});

        return new Promise((resolve, reject) => this.secureSetupResolve = resolve);
    }

    private async sendUnencrypted(message: any) {
        if (!this.connected) {
            await this.connect();
        }

        message.timestamp = Date.now();

        this.port.postMessage({appId: this.appId, message: message});
    }

    private async showFingerprintDialog() {
        const fingerprint = (await this.cryptoService.getFingerprint(await this.userService.getUserId(), this.publicKey)).join(' ');

        this.messagingService.send('showDialog', {
            html: `${this.i18nService.t('desktopIntegrationVerificationText')}<br><br><strong>${fingerprint}</strong>`,
            title: this.i18nService.t('desktopSyncVerificationTitle'),
            confirmText: this.i18nService.t('ok'),
            type: 'warning',
        });
    }
}
