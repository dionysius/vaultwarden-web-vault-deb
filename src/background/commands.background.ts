import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

export default class CommandsBackground {
    private isSafari: boolean;
    private isVivaldi: boolean;

    constructor(private main: MainBackground, private passwordGenerationService: PasswordGenerationService,
        private platformUtilsService: PlatformUtilsService, private vaultTimeoutService: VaultTimeoutService) {
        this.isSafari = this.platformUtilsService.isSafari();
        this.isVivaldi = this.platformUtilsService.isVivaldi();
    }

    async init() {
        if (this.isVivaldi) {
            BrowserApi.messageListener('commands.background', async (msg: any, sender: any, sendResponse: any) => {
                if (msg.command === 'keyboardShortcutTriggered' && msg.shortcut) {
                    await this.processCommand(msg.shortcut, sender);
                }
            });
        } else if (chrome && chrome.commands) {
            chrome.commands.onCommand.addListener(async (command: any) => {
                await this.processCommand(command);
            });
        }
    }

    private async processCommand(command: string, sender?: any) {
        switch (command) {
            case 'generate_password':
                await this.generatePasswordToClipboard();
                break;
            case 'autofill_login':
                await this.autoFillLogin(sender ? sender.tab : null);
                break;
            case 'open_popup':
                await this.openPopup();
                break;
            case 'lock_vault':
                await this.vaultTimeoutService.lock(true);
                break;
            default:
                break;
        }
    }

    private async generatePasswordToClipboard() {
        const options = (await this.passwordGenerationService.getOptions())[0];
        const password = await this.passwordGenerationService.generatePassword(options);
        this.platformUtilsService.copyToClipboard(password, { window: window });
        this.passwordGenerationService.addHistory(password);
    }

    private async autoFillLogin(tab?: any) {
        if (await this.vaultTimeoutService.isLocked()) {
            return;
        }

        if (!tab) {
            tab = await BrowserApi.getTabFromCurrentWindowId();
        }

        if (tab == null) {
            return;
        }

        await this.main.collectPageDetailsForContentScript(tab, 'autofill_cmd');
    }

    private async openPopup() {
        // Chrome APIs cannot open popup
        if (!this.isSafari) {
            return;
        }

        this.main.openPopup();
    }
}
