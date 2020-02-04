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

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EventService } from 'jslib/abstractions/event.service';
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
        tokenService: TokenService, i18nService: I18nService,
        cryptoService: CryptoService, platformUtilsService: PlatformUtilsService,
        auditService: AuditService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        changeDetectorRef: ChangeDetectorRef, userService: UserService,
        eventService: EventService) {
        super(cipherService, totpService, tokenService, i18nService, cryptoService, platformUtilsService,
            auditService, window, broadcasterService, ngZone, changeDetectorRef, userService, eventService);
    }

    ngOnInit() {
        this.showAttachments = !this.platformUtilsService.isEdge();
        const queryParamsSub = this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            } else {
                this.close();
            }

            await this.load();
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
        super.ngOnInit();
    }

    edit() {
        super.edit();
        this.router.navigate(['/edit-cipher'], { queryParams: { cipherId: this.cipher.id } });
    }

    clone() {
        super.clone();
        this.router.navigate(['/clone-cipher'], {
            queryParams: {
                cloneMode: true,
                cipherId: this.cipher.id,
            },
        });
    }

    close() {
        this.location.back();
    }
}
