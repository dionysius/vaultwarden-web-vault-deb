import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { LockGuardService as BaseLockGuardService } from 'jslib-angular/services/lock-guard.service';

@Injectable()
export class LockGuardService extends BaseLockGuardService {
    constructor(vaultTimeoutService: VaultTimeoutService, userService: UserService,
        router: Router) { 
        super(vaultTimeoutService, userService, router);
        }

    protected homepage = 'tabs/current';
}
