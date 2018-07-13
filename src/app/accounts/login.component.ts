import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, private route: ActivatedRoute,
        storageService: StorageService, private stateService: StateService) {
        super(authService, router, analytics, toasterService, i18nService, storageService);
        this.onSuccessfulLoginNavigate = this.goAfterLogIn;
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (qParams) => {
            if (qParams.email != null && qParams.email.indexOf('@') > -1) {
                this.email = qParams.email;
            }
            await super.ngOnInit();
        });
    }

    async goAfterLogIn() {
        const invite = await this.stateService.get<any>('orgInvitation');
        if (invite != null) {
            this.router.navigate(['accept-organization'], { queryParams: invite });
        } else {
            this.router.navigate([this.successRoute]);
        }
    }
}
