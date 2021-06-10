import { Injectable } from '@angular/core';

import { LockGuardService as BaseLockGuardService } from 'jslib-angular/services/lock-guard.service';

@Injectable()
export class LockGuardService extends BaseLockGuardService {
    protected homepage = 'tabs/current';
}
