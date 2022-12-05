import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";

import { BrowserStateService } from "../services/abstractions/browser-state.service";

import { setClearClipboardTime } from "./clipboard-state";
import { copyToClipboard } from "./copy-to-clipboard-command";

export class GeneratePasswordToClipboardCommand {
  constructor(
    private passwordGenerationService: PasswordGenerationService,
    private stateService: BrowserStateService
  ) {}

  async generatePasswordToClipboard(tab: chrome.tabs.Tab) {
    const [options] = await this.passwordGenerationService.getOptions();
    const password = await this.passwordGenerationService.generatePassword(options);

    copyToClipboard(tab, password);

    const clearClipboard = await this.stateService.getClearClipboard();

    if (clearClipboard != null) {
      await setClearClipboardTime(this.stateService, Date.now() + clearClipboard * 1000);
    }
  }
}
