import { Location } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ViewComponent as BaseViewComponent } from 'jslib/angular/components/view.component';

@Component({
    selector: 'app-vault-view',
    templateUrl: 'view.component.html',
})
export class ViewComponent extends BaseViewComponent {
    showAttachments = true;

    constructor(cipherService: CipherService, totpService: TotpService,
        tokenService: TokenService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, analytics: Angulartics2,
        auditService: AuditService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        changeDetectorRef: ChangeDetectorRef, userService: UserService) {
        super(cipherService, totpService, tokenService, cryptoService, platformUtilsService,
            i18nService, analytics, auditService, window, broadcasterService, ngZone, changeDetectorRef, userService);
    }

    ngOnInit() {
        this.showAttachments = !this.platformUtilsService.isEdge();
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            } else {
                this.close();
            }

            await this.load();
        });
        super.ngOnInit();
    }

    edit() {
        super.edit();
        this.router.navigate(['/edit-cipher'], { queryParams: { cipherId: this.cipher.id } });
    }

    close() {
        this.location.back();
    }
}
