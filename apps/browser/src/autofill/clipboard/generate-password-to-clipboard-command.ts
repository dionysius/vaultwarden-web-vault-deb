import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { setAlarmTime } from "../../platform/alarms/alarm-state";
import { BrowserStateService } from "../../platform/services/abstractions/browser-state.service";

import { clearClipboardAlarmName } from "./clear-clipboard";
import { copyToClipboard } from "./copy-to-clipboard-command";

export class GeneratePasswordToClipboardCommand {
  constructor(
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private stateService: BrowserStateService,
  ) {}

  async generatePasswordToClipboard(tab: chrome.tabs.Tab) {
    const [options] = await this.passwordGenerationService.getOptions();
    const password = await this.passwordGenerationService.generatePassword(options);

    copyToClipboard(tab, password);

    const clearClipboard = await this.stateService.getClearClipboard();

    if (clearClipboard != null) {
      await setAlarmTime(clearClipboardAlarmName, clearClipboard * 1000);
    }
  }
}
