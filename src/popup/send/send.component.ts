import {
    Component,
    NgZone,
} from '@angular/core';

import { SendView } from 'jslib/models/view/sendView';

import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SendService } from 'jslib/abstractions/send.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent extends BaseSendComponent {
    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        broadcasterService: BroadcasterService, ngZone: NgZone) {
        super(sendService, i18nService, platformUtilsService, environmentService, broadcasterService, ngZone);
    }

    addSend() {
        // TODO
    }

    editSend(send: SendView) {
        // TODO
    }
}
