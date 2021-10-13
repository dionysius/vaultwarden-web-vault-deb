import { CipherType } from 'jslib-common/enums/cipherType';

import { CipherView } from 'jslib-common/models/view/cipherView';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';
import { LoginView } from 'jslib-common/models/view/loginView';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SystemService } from 'jslib-common/abstractions/system.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { PopupUtilsService } from '../popup/services/popup-utils.service';
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

    private lockedVaultPendingNotifications: any[] = [];

    constructor(private main: MainBackground, private autofillService: AutofillService,
        private cipherService: CipherService, private platformUtilsService: BrowserPlatformUtilsService,
        private storageService: StorageService, private i18nService: I18nService,
        private notificationsService: NotificationsService,
        private systemService: SystemService, private vaultTimeoutService: VaultTimeoutService,
        private environmentService: EnvironmentService, private policyService: PolicyService,
        private userService: UserService, private messagingService: MessagingService,
        private folderService: FolderService, private popupUtilsService: PopupUtilsService) {

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
                await this.main.setIcon();
                await this.main.refreshBadgeAndMenu(false);
                this.notificationsService.updateConnection(msg.command === 'unlocked');
                this.systemService.cancelProcessReload();

                if (this.lockedVaultPendingNotifications.length > 0) {
                    const retryItem = this.lockedVaultPendingNotifications.pop();
                    await this.processMessage(retryItem.msg, retryItem.sender, null);

                    await BrowserApi.closeLoginTab();

                    if (retryItem?.sender?.tab?.id) {
                        await BrowserApi.focusSpecifiedTab(retryItem.sender.tab.id);
                    }
                }
                break;
            case 'addToLockedVaultPendingNotifications':
                const retryMessage = {
                    msg: msg.retryItem,
                    sender: sender,
                };
                this.lockedVaultPendingNotifications.push(retryMessage);
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
            case 'bgGetDataForTab':
                await this.getDataForTab(sender.tab, msg.responseCommand);
                break;
            case 'bgCloseNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'closeNotificationBar');
                break;
            case 'bgAdjustNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'adjustNotificationBar', msg.data);
                break;
            case 'bgCollectPageDetails':
                await this.main.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
                break;
            case 'bgAddLogin':
                await this.addLogin(msg.login, sender.tab);
                break;
            case 'bgChangedPassword':
                await this.changedPassword(msg.data, sender.tab);
                break;
            case 'bgAddClose':
            case 'bgChangeClose':
                this.removeTabFromNotificationQueue(sender.tab);
                break;
            case 'bgAddSave':
            case 'bgChangeSave':
                await this.saveOrUpdateCredentials(sender.tab, msg.folder);
                break;
            case 'bgNeverSave':
                await this.saveNever(sender.tab);
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
                    case 'notificationBar':
                        const forms = this.autofillService.getFormsWithPasswordFields(msg.details);
                        await BrowserApi.tabSendMessageData(msg.tab, 'notificationBarPageDetails', {
                            details: msg.details,
                            forms: forms,
                        });
                        break;
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

    private async saveOrUpdateCredentials(tab: any, folderId?: string) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.main.notificationQueue[i];
            if (queueMessage.tabId !== tab.id ||
                (queueMessage.type !== 'addLogin' && queueMessage.type !== 'changePassword')) {
                continue;
            }

            const tabDomain = Utils.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.main.notificationQueue.splice(i, 1);
            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');

            if (queueMessage.type === 'changePassword') {
                const message = (queueMessage as AddChangePasswordQueueMessage);
                const cipher = await this.getDecryptedCipherById(message.cipherId);
                if (cipher == null) {
                    return;
                }
                await this.updateCipher(cipher, message.newPassword);
                return;
            }

            if (!queueMessage.wasVaultLocked) {
                await this.createNewCipher(queueMessage, folderId);
            }

            // If the vault was locked, check if a cipher needs updating instead of creating a new one
            if (queueMessage.type === 'addLogin' && queueMessage.wasVaultLocked === true) {
                const message = (queueMessage as AddLoginQueueMessage);
                const ciphers = await this.cipherService.getAllDecryptedForUrl(message.uri);
                const usernameMatches = ciphers.filter(c => c.login.username != null &&
                    c.login.username.toLowerCase() === message.username);

                if (usernameMatches.length >= 1) {
                    await this.updateCipher(usernameMatches[0], message.password);
                    return;
                }

                await this.createNewCipher(message, folderId);
            }
        }
    }

    private async createNewCipher(queueMessage: AddLoginQueueMessage, folderId: string) {
        const loginModel = new LoginView();
        const loginUri = new LoginUriView();
        loginUri.uri = queueMessage.uri;
        loginModel.uris = [loginUri];
        loginModel.username = queueMessage.username;
        loginModel.password = queueMessage.password;
        const model = new CipherView();
        model.name = Utils.getHostname(queueMessage.uri) || queueMessage.domain;
        model.name = model.name.replace(/^www\./, '');
        model.type = CipherType.Login;
        model.login = loginModel;

        if (!Utils.isNullOrWhitespace(folderId)) {
            const folders = await this.folderService.getAllDecrypted();
            if (folders.some(x => x.id === folderId)) {
                model.folderId = folderId;
            }
        }

        const cipher = await this.cipherService.encrypt(model);
        await this.cipherService.saveWithServer(cipher);
    }

    private async getDecryptedCipherById(cipherId: string) {
        const cipher = await this.cipherService.get(cipherId);
        if (cipher != null && cipher.type === CipherType.Login) {
            return await cipher.decrypt();
        }
        return null;
    }

    private async updateCipher(cipher: CipherView, newPassword: string) {
        if (cipher != null && cipher.type === CipherType.Login) {
            cipher.login.password = newPassword;
            const newCipher = await this.cipherService.encrypt(cipher);
            await this.cipherService.saveWithServer(newCipher);
        }
    }

    private async saveNever(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.main.notificationQueue[i];
            if (queueMessage.tabId !== tab.id || queueMessage.type !== 'addLogin') {
                continue;
            }

            const tabDomain = Utils.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.main.notificationQueue.splice(i, 1);
            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');

            const hostname = Utils.getHostname(tab.url);
            await this.cipherService.saveNeverDomain(hostname);
        }
    }

    private async addLogin(loginInfo: any, tab: any) {
        const loginDomain = Utils.getDomain(loginInfo.url);
        if (loginDomain == null) {
            return;
        }

        let normalizedUsername = loginInfo.username;
        if (normalizedUsername != null) {
            normalizedUsername = normalizedUsername.toLowerCase();
        }

        if (await this.vaultTimeoutService.isLocked()) {
            this.pushAddLoginToQueue(loginDomain, loginInfo, tab, true);
            return;
        }

        const ciphers = await this.cipherService.getAllDecryptedForUrl(loginInfo.url);
        const usernameMatches = ciphers.filter(c =>
            c.login.username != null && c.login.username.toLowerCase() === normalizedUsername);
        if (usernameMatches.length === 0) {
            const disabledAddLogin = await this.storageService.get<boolean>(
                ConstantsService.disableAddLoginNotificationKey);
            if (disabledAddLogin) {
                return;
            }

            if (!(await this.allowPersonalOwnership())) {
                return;
            }

            this.pushAddLoginToQueue(loginDomain, loginInfo, tab);

        } else if (usernameMatches.length === 1 && usernameMatches[0].login.password !== loginInfo.password) {
            const disabledChangePassword = await this.storageService.get<boolean>(
                ConstantsService.disableChangedPasswordNotificationKey);
            if (disabledChangePassword) {
                return;
            }
            this.pushChangePasswordToQueue(usernameMatches[0].id, loginDomain, loginInfo.password, tab);
        }
    }

    private async pushAddLoginToQueue(loginDomain: string, loginInfo: any, tab: any, isVaultLocked: boolean = false) {
        // remove any old messages for this tab
        this.removeTabFromNotificationQueue(tab);
        const message: AddLoginQueueMessage = {
            type: 'addLogin',
            username: loginInfo.username,
            password: loginInfo.password,
            domain: loginDomain,
            uri: loginInfo.url,
            tabId: tab.id,
            expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
            wasVaultLocked: isVaultLocked,
        };
        this.main.notificationQueue.push(message);
        await this.main.checkNotificationQueue(tab);
    }

    private async changedPassword(changeData: any, tab: any) {
        const loginDomain = Utils.getDomain(changeData.url);
        if (loginDomain == null) {
            return;
        }

        if (await this.vaultTimeoutService.isLocked()) {
            this.pushChangePasswordToQueue(null, loginDomain, changeData.newPassword, tab, true);
            return;
        }

        let id: string = null;
        const ciphers = await this.cipherService.getAllDecryptedForUrl(changeData.url);
        if (changeData.currentPassword != null) {
            const passwordMatches = ciphers.filter(c => c.login.password === changeData.currentPassword);
            if (passwordMatches.length === 1) {
                id = passwordMatches[0].id;
            }
        } else if (ciphers.length === 1) {
            id = ciphers[0].id;
        }
        if (id != null) {
            this.pushChangePasswordToQueue(id, loginDomain, changeData.newPassword, tab);
        }
    }

    private async pushChangePasswordToQueue(cipherId: string, loginDomain: string, newPassword: string, tab: any, isVaultLocked: boolean = false) {
        // remove any old messages for this tab
        this.removeTabFromNotificationQueue(tab);
        const message: AddChangePasswordQueueMessage = {
            type: 'changePassword',
            cipherId: cipherId,
            newPassword: newPassword,
            domain: loginDomain,
            tabId: tab.id,
            expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
            wasVaultLocked: isVaultLocked,
        };
        this.main.notificationQueue.push(message);
        await this.main.checkNotificationQueue(tab);
    }

    private removeTabFromNotificationQueue(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            if (this.main.notificationQueue[i].tabId === tab.id) {
                this.main.notificationQueue.splice(i, 1);
            }
        }
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

    private async getDataForTab(tab: any, responseCommand: string) {
        const responseData: any = {};
        if (responseCommand === 'notificationBarGetFoldersList') {
            responseData.folders = await this.folderService.getAllDecrypted();
        }

        await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
    }

    private async allowPersonalOwnership(): Promise<boolean> {
        return !await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership);
    }
}
