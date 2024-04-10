import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { SearchService } from "@bitwarden/common/services/search.service";

export class PopupSearchService extends SearchService {
  constructor(logService: LogService, i18nService: I18nService, stateProvider: StateProvider) {
    super(logService, i18nService, stateProvider);
  }

  clearIndex(): Promise<void> {
    throw new Error("Not available.");
  }

  indexCiphers(): Promise<void> {
    throw new Error("Not available.");
  }

  async getIndexForSearch() {
    return await super.getIndexForSearch();
  }
}
