import { Injectable } from '@angular/core';
import {
    Router,
} from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { UnauthGuardService as BaseUnauthGuardService } from 'jslib/angular/services/unauth-guard.service';

@Injectable()
export class UnauthGuardService extends BaseUnauthGuardService {
    constructor(private vaultTimeoutService: VaultTimeoutService, private userService: UserService,
        private router: Router) {
        super(vaultTimeoutService, userService, router);
        }

    protected landingPage: '/tabs/current';
}
