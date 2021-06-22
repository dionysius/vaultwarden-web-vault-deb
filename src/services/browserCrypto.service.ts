import { KeySuffixOptions } from 'jslib-common/abstractions/storage.service';
import { CryptoService } from 'jslib-common/services/crypto.service';

export class BrowserCryptoService extends CryptoService {
    protected async retrieveKeyFromStorage(keySuffix: KeySuffixOptions) {
        if (keySuffix === 'biometric') {
            await this.platformUtilService.authenticateBiometric();
            return (await this.getKey())?.keyB64;
        }

        return await super.retrieveKeyFromStorage(keySuffix);
    }

}
