import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { ConsoleLogService } from 'jslib/services/consoleLog.service';
import { SearchService } from 'jslib/services/search.service';

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
