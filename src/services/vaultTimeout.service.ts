import { VaultTimeoutService as BaseVaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';
import { SafariApp } from '../browser/safariApp';

export default class VaultTimeoutService extends BaseVaultTimeoutService {

    startCheck() {
        this.checkVaultTimeout();
        if (this.platformUtilsService.isSafari()) {
            this.checkSafari();
        } else {
            setInterval(() => this.checkVaultTimeout(), 10 * 1000); // check every 10 seconds
        }
    }

    // This is a work-around to safari adding an arbitary delay to setTimeout and
    //  setIntervals. It works by calling the native extension which sleeps for 10s,
    //  efficiently replicating setInterval.
    async checkSafari() {
        while (true) {
            try {
                await SafariApp.sendMessageToApp('sleep');
                this.checkVaultTimeout();
            } catch (e) {
                // tslint:disable-next-line
                console.log('Exception Safari VaultTimeout', e);
            }
        }
    }
}
