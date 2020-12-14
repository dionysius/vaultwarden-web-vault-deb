import { CipherService } from 'jslib/abstractions/cipher.service';

import { ConsoleLogService } from 'jslib/services/consoleLog.service';
import { SearchService } from 'jslib/services/search.service';

export class PopupSearchService extends SearchService {
    constructor(private mainSearchService: SearchService, cipherService: CipherService,
        consoleLogService: ConsoleLogService) {
        super(cipherService, consoleLogService);
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
