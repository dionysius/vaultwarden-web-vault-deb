import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SystemService } from 'jslib-common/abstractions/system.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';
import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { Utils } from 'jslib-common/misc/utils';

import { PolicyType } from 'jslib-common/enums/policyType';

import AddChangePasswordQueueMessage from './models/addChangePasswordQueueMessage';
import AddLoginQueueMessage from './models/addLoginQueueMessage';

export default class RuntimeBackground {
    private runtime: any;
    private autofillTimeout: any;
    private pageDetailsToAutoFill: any[] = [];
    private onInstalledReason: string = null;

    constructor(private main: MainBackground, private autofillService: AutofillService,
        private platformUtilsService: BrowserPlatformUtilsService,
        private storageService: StorageService, private i18nService: I18nService,
        private notificationsService: NotificationsService, private systemService: SystemService,
        private environmentService: EnvironmentService, private messagingService: MessagingService) {

        // onInstalled listener must be wired up before anything else, so we do it in the ctor
        chrome.runtime.onInstalled.addListener((details: any) => {
            this.onInstalledReason = details.reason;
        });
    }

    async init() {
        if (!chrome.runtime) {
            return;
        }

        await this.checkOnInstalled();
        BrowserApi.messageListener('runtime.background', async (msg: any, sender: any, sendResponse: any) => {
            await this.processMessage(msg, sender, sendResponse);
        });
    }

    async processMessage(msg: any, sender: any, sendResponse: any) {
        switch (msg.command) {
            case 'loggedIn':
            case 'unlocked':
                if (this.main.lockedVaultPendingNotifications.length > 0) {
                    await BrowserApi.closeLoginTab();

                    const item = this.main.lockedVaultPendingNotifications[0];
                    if (item.commandToRetry?.sender?.tab?.id) {
                        await BrowserApi.focusSpecifiedTab(item.commandToRetry.sender.tab.id);
                    }
                }

                await this.main.setIcon();
                await this.main.refreshBadgeAndMenu(false);
                this.notificationsService.updateConnection(msg.command === 'unlocked');
                this.systemService.cancelProcessReload();

                this.main.unlockCompleted();
                break;
            case 'addToLockedVaultPendingNotifications':
                const retryMessage = {
                    commandToRetry: {
                        ...msg.retryItem,
                        sender: sender
                    },
                    from: msg.from,
                };
                this.main.lockedVaultPendingNotifications.push(retryMessage);
                break;
            case 'logout':
                await this.main.logout(msg.expired);
                break;
            case 'syncCompleted':
                if (msg.successfully) {
                    setTimeout(async () => await this.main.refreshBadgeAndMenu(), 2000);
                }
                break;
            case 'openPopup':
                await this.main.openPopup();
                break;
            case 'promptForLogin':
                await BrowserApi.createNewTab('popup/index.html?uilocation=popout', true, true);
                break;
            case 'showDialogResolve':
                this.platformUtilsService.resolveDialogPromise(msg.dialogId, msg.confirmed);
                break;
            case 'bgCollectPageDetails':
                await this.main.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
                break;
            case 'bgUpdateContextMenu':
            case 'editedCipher':
            case 'addedCipher':
            case 'deletedCipher':
                await this.main.refreshBadgeAndMenu();
                break;
            case 'bgReseedStorage':
                await this.main.reseedStorage();
                break;
            case 'collectPageDetailsResponse':
                switch (msg.sender) {
                    case 'autofiller':
                    case 'autofill_cmd':
                        const totpCode = await this.autofillService.doAutoFillActiveTab([{
                            frameId: sender.frameId,
                            tab: msg.tab,
                            details: msg.details,
                        }], msg.sender === 'autofill_cmd');
                        if (totpCode != null) {
                            this.platformUtilsService.copyToClipboard(totpCode, { window: window });
                        }
                        break;
                    case 'contextMenu':
                        clearTimeout(this.autofillTimeout);
                        this.pageDetailsToAutoFill.push({
                            frameId: sender.frameId,
                            tab: msg.tab,
                            details: msg.details,
                        });
                        this.autofillTimeout = setTimeout(async () => await this.autofillPage(), 300);
                        break;
                    default:
                        break;
                }
                break;
            case 'authResult':
                const vaultUrl = this.environmentService.getWebVaultUrl();

                if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
                    return;
                }

                try {
                    BrowserApi.createNewTab('popup/index.html?uilocation=popout#/sso?code=' +
                        msg.code + '&state=' + msg.state);
                }
                catch { }
                break;
            case 'webAuthnResult':
                const vaultUrl2 = this.environmentService.getWebVaultUrl();

                if (msg.referrer == null || Utils.getHostname(vaultUrl2) !== msg.referrer) {
                    return;
                }

                const params = `webAuthnResponse=${encodeURIComponent(msg.data)};remember=${msg.remember}`;
                BrowserApi.createNewTab(`popup/index.html?uilocation=popout#/2fa;${params}`, undefined, false);
                break;
            case 'reloadPopup':
                this.messagingService.send('reloadPopup');
                break;
            case 'emailVerificationRequired':
                this.messagingService.send('showDialog', {
                    dialogId: 'emailVerificationRequired',
                    title: this.i18nService.t('emailVerificationRequired'),
                    text: this.i18nService.t('emailVerificationRequiredDesc'),
                    confirmText: this.i18nService.t('ok'),
                    type: 'info',
                });
                break;
            case 'getClickedElementResponse':
                this.platformUtilsService.copyToClipboard(msg.identifier, { window: window });
            default:
                break;
        }
    }

    private async autofillPage() {
        const totpCode = await this.autofillService.doAutoFill({
            cipher: this.main.loginToAutoFill,
            pageDetails: this.pageDetailsToAutoFill,
            fillNewPassword: true,
        });

        if (totpCode != null) {
            this.platformUtilsService.copyToClipboard(totpCode, { window: window });
        }

        // reset
        this.main.loginToAutoFill = null;
        this.pageDetailsToAutoFill = [];
    }

    private async checkOnInstalled() {
        setTimeout(async () => {
            if (this.onInstalledReason != null) {
                if (this.onInstalledReason === 'install') {
                    BrowserApi.createNewTab('https://bitwarden.com/browser-start/');
                    await this.setDefaultSettings();
                }

                this.onInstalledReason = null;
            }
        }, 100);
    }

    private async setDefaultSettings() {
        // Default timeout option to "on restart".
        const currentVaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
        if (currentVaultTimeout == null) {
            await this.storageService.save(ConstantsService.vaultTimeoutKey, -1);
        }

        // Default action to "lock".
        const currentVaultTimeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
        if (currentVaultTimeoutAction == null) {
            await this.storageService.save(ConstantsService.vaultTimeoutActionKey, 'lock');
        }
    }
}
