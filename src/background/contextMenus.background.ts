import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { Analytics } from 'jslib/misc';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

export default class ContextMenusBackground {
    private contextMenus: any;

    constructor(private main: MainBackground, private cipherService: CipherService,
        private passwordGenerationService: PasswordGenerationService, private analytics: Analytics,
        private platformUtilsService: PlatformUtilsService, private lockService: LockService) {
        this.contextMenus = chrome.contextMenus;
    }

    async init() {
        if (!this.contextMenus) {
            return;
        }

        this.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
            if (info.menuItemId === 'generate-password') {
                await this.generatePasswordToClipboard();
            } else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
                info.parentMenuItemId === 'copy-password') {
                await this.cipherAction(info);
            }
        });
    }

    private async generatePasswordToClipboard() {
        if (await this.lockService.isLocked()) {
            return;
        }

        const options = await this.passwordGenerationService.getOptions();
        const password = await this.passwordGenerationService.generatePassword(options);
        this.platformUtilsService.copyToClipboard(password, { window: window });
        this.passwordGenerationService.addHistory(password);

        this.analytics.ga('send', {
            hitType: 'event',
            eventAction: 'Generated Password From Context Menu',
        });
    }

    private async cipherAction(info: any) {
        const id = info.menuItemId.split('_')[1];
        if (id === 'noop') {
            if (chrome.browserAction && chrome.browserAction.openPopup) {
                chrome.browserAction.openPopup();
            }
            return;
        }

        if (await this.lockService.isLocked()) {
            return;
        }

        const ciphers = await this.cipherService.getAllDecrypted();
        const cipher = ciphers.find((c) => c.id === id);
        if (cipher == null) {
            return;
        }

        if (info.parentMenuItemId === 'autofill') {
            this.analytics.ga('send', {
                hitType: 'event',
                eventAction: 'Autofilled From Context Menu',
            });
            await this.startAutofillPage(cipher);
        } else if (info.parentMenuItemId === 'copy-username') {
            this.analytics.ga('send', {
                hitType: 'event',
                eventAction: 'Copied Username From Context Menu',
            });
            this.platformUtilsService.copyToClipboard(cipher.login.username, { window: window });
        } else if (info.parentMenuItemId === 'copy-password') {
            this.analytics.ga('send', {
                hitType: 'event',
                eventAction: 'Copied Password From Context Menu',
            });
            this.platformUtilsService.copyToClipboard(cipher.login.password, { window: window });
        }
    }

    private async startAutofillPage(cipher: any) {
        this.main.loginToAutoFill = cipher;
        const tab = await BrowserApi.getTabFromCurrentWindow();
        if (tab == null) {
            return;
        }

        BrowserApi.tabSendMessage(tab, {
            command: 'collectPageDetails',
            tab: tab,
            sender: 'contextMenu',
        });
    }
}
