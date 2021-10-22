import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { first } from 'rxjs/operators';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ShareComponent as BaseShareComponent } from 'jslib-angular/components/share.component';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent extends BaseShareComponent {
    constructor(collectionService: CollectionService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, userService: UserService,
        cipherService: CipherService, private route: ActivatedRoute,
        private router: Router, logService: LogService) {
        super(collectionService, platformUtilsService, i18nService, userService, cipherService,
            logService);
    }

    async ngOnInit() {
        this.onSharedCipher.subscribe(() => {
            this.router.navigate(['view-cipher', { cipherId: this.cipherId }]);
        });
        this.route.queryParams.pipe(first()).subscribe(async params => {
            this.cipherId = params.cipherId;
            await this.load();
        });
    }

    async submit(): Promise<boolean> {
        const success = await super.submit();
        if (success) {
            this.cancel();
        }
        return success;
    }

    cancel() {
        this.router.navigate(['/view-cipher'], { replaceUrl: true, queryParams: { cipherId: this.cipher.id } });
    }
}
