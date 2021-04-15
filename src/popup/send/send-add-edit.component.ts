import {
    DatePipe,
    Location,
} from '@angular/common';

import { Component } from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PopupUtilsService } from '../services/popup-utils.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/send/add-edit.component';

@Component({
    selector: 'app-send-add-edit',
    templateUrl: 'send-add-edit.component.html',
})
export class SendAddEditComponent extends BaseAddEditComponent {
    // Options header
    showOptions = false;
    // File visibility
    isFirefox = false;
    inPopout = false;
    inSidebar = false;
    isLinux = false;
    isUnsupportedMac = false;

    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        userService: UserService, messagingService: MessagingService, policyService: PolicyService,
        environmentService: EnvironmentService, datePipe: DatePipe, sendService: SendService,
        private route: ActivatedRoute, private router: Router, private location: Location,
        private popupUtilsService: PopupUtilsService) {
        super(i18nService, platformUtilsService, environmentService, datePipe, sendService, userService,
            messagingService, policyService);
    }

    get showFileSelector(): boolean {
        return !(this.editMode || this.showFilePopoutMessage);
    }

    get showFilePopoutMessage(): boolean {
        return !this.editMode && (this.showFirefoxFileWarning || this.showSafariFileWarning || this.showChromiumFileWarning);
    }

    get showFirefoxFileWarning(): boolean {
        return this.isFirefox && !(this.inSidebar || this.inPopout);
    }

    get showSafariFileWarning(): boolean {
        return this.isSafari && !this.inPopout;
    }

    // Only show this for Chromium based browsers in Linux and Mac > Big Sur
    get showChromiumFileWarning(): boolean {
        return (this.isLinux || this.isUnsupportedMac) && !this.isFirefox && !(this.inSidebar || this.inPopout);
    }

    popOutWindow() {
        this.popupUtilsService.popOut(window);
    }

    async ngOnInit() {
        // File visilibity
        this.isFirefox = this.platformUtilsService.isFirefox();
        this.inPopout = this.popupUtilsService.inPopout(window);
        this.inSidebar = this.popupUtilsService.inSidebar(window);
        this.isLinux = window?.navigator?.userAgent.indexOf('Linux') !== -1;
        this.isUnsupportedMac = this.platformUtilsService.isChrome() && window?.navigator?.appVersion.includes('Mac OS X 11');

        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            if (params.sendId) {
                this.sendId = params.sendId;
            }
            if (params.type) {
                const type = parseInt(params.type, null);
                this.type = type;
            }
            await this.load();

            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });

        window.setTimeout(() => {
            if (!this.editMode) {
                document.getElementById('name').focus();
            }
        }, 200);
    }

    async submit(): Promise<boolean> {
        if (await super.submit()) {
            this.cancel();
            return true;
        }

        return false;
    }

    async delete(): Promise<boolean> {
        if (await super.delete()) {
            this.cancel();
            return true;
        }

        return false;
    }

    cancel() {
        // If true, the window was pop'd out on the add-send page. location.back will not work
        if ((window as any).previousPopupUrl.startsWith('/add-send')) {
            this.router.navigate(['tabs/send']);
        } else {
            this.location.back();
        }
    }
}
