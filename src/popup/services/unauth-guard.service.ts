import { Injectable } from '@angular/core';

import { UnauthGuardService as BaseUnauthGuardService } from 'jslib-angular/services/unauth-guard.service';

@Injectable()
export class UnauthGuardService extends BaseUnauthGuardService {
    protected homepage = 'tabs/current';
}
