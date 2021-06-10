import { BrowserApi } from '../../browser/browserApi';

import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { UnauthGuardService } from './unauth-guard.service';

@Injectable()
export class LaunchGuardService implements CanActivate {
    constructor(private router: Router, private unauthGuardService: UnauthGuardService) { }

    async canActivate() {
        if (BrowserApi.getBackgroundPage() == null) {
            this.router.navigate(['private-mode']);
            return false;
        }
        return await this.unauthGuardService.canActivate();
    }
}
