import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { ConsoleLogService } from 'jslib-common/services/consoleLog.service';
import { SearchService } from 'jslib-common/services/search.service';

export class PopupSearchService extends SearchService {
    constructor(private mainSearchService: SearchService, cipherService: CipherService,
        consoleLogService: ConsoleLogService, i18nService: I18nService) {
        super(cipherService, consoleLogService, i18nService);
    }

    clearIndex() {
        throw new Error('Not available.');
    }

    indexCiphers(): Promise<void> {
        throw new Error('Not available.');
    }

    getIndexForSearch() {
        return this.mainSearchService.getIndexForSearch();
    }
}
