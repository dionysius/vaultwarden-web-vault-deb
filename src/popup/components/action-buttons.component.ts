import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CipherType } from 'jslib/enums/cipherType';
import { EventType } from 'jslib/enums/eventType';

import { CipherView } from 'jslib/models/view/cipherView';

import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PopupUtilsService } from '../services/popup-utils.service';

@Component({
    selector: 'app-action-buttons',
    templateUrl: 'action-buttons.component.html',
})
export class ActionButtonsComponent {
    @Output() onView = new EventEmitter<CipherView>();
    @Output() launchEvent = new EventEmitter<CipherView>();
    @Input() cipher: CipherView;
    @Input() showView = false;

    cipherType = CipherType;
    userHasPremiumAccess = false;

    constructor(private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService, private eventService: EventService,
        private totpService: TotpService, private userService: UserService) { }

    async ngOnInit() {
        this.userHasPremiumAccess = await this.userService.canAccessPremium();
    }

    launchCipher() {
        this.launchEvent.emit(this.cipher);
    }

    async copy(cipher: CipherView, value: string, typeI18nKey: string, aType: string) {
        if (value == null || aType === 'TOTP' && !this.displayTotpCopyButton(cipher)) {
            return;
        } else if (value === cipher.login.totp) {
            value = await this.totpService.getCode(value);
        }

        if (!cipher.viewPassword) {
            return;
        }

        this.platformUtilsService.copyToClipboard(value, { window: window });
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));

        if (typeI18nKey === 'password' || typeI18nKey === 'verificationCodeTotp') {
            this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, cipher.id);
        } else if (typeI18nKey === 'securityCode') {
            this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
        }
    }

    displayTotpCopyButton(cipher: CipherView) {
        return (cipher?.login?.hasTotp ?? false) &&
            (cipher.organizationUseTotp || this.userHasPremiumAccess);
    }

    view() {
        this.onView.emit(this.cipher);
    }
}
