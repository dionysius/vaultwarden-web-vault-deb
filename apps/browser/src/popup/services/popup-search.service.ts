import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { SearchService } from "@bitwarden/common/services/search.service";

export class PopupSearchService extends SearchService {
  constructor(
    private mainSearchService: SearchService,
    logService: LogService,
    i18nService: I18nService,
  ) {
    super(logService, i18nService);
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
