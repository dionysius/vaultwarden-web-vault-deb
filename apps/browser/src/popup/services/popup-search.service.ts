import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

export class PopupSearchService extends SearchService {
  constructor(
    private mainSearchService: SearchService,
    cipherService: CipherService,
    consoleLogService: ConsoleLogService,
    i18nService: I18nService
  ) {
    super(cipherService, consoleLogService, i18nService);
  }

  clearIndex() {
    throw new Error("Not available.");
  }

  indexCiphers(): Promise<void> {
    throw new Error("Not available.");
  }

  getIndexForSearch() {
    return this.mainSearchService.getIndexForSearch();
  }
}
