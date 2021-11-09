import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { ExportComponent as BaseExportComponent } from 'jslib-angular/components/export.component';

@Component({
    selector: 'app-export',
    templateUrl: 'export.component.html',
})
export class ExportComponent extends BaseExportComponent {
    constructor(cryptoService: CryptoService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, exportService: ExportService,
        eventService: EventService, policyService: PolicyService, private router: Router,
        logService: LogService, userVerificationService: UserVerificationService, fb: FormBuilder) {
        super(cryptoService, i18nService, platformUtilsService, exportService, eventService, policyService, window,
            logService, userVerificationService, fb);
    }

    protected saved() {
        super.saved();
        this.router.navigate(['/tabs/settings']);
    }
}
