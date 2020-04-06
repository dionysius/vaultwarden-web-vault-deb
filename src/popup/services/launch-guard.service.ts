import { BrowserApi } from '../../browser/browserApi';

import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

@Injectable()
export class LaunchGuardService implements CanActivate {
    constructor(private vaultTimeoutService: VaultTimeoutService, private userService: UserService,
        private router: Router) { }

    async canActivate() {
        if (BrowserApi.getBackgroundPage() == null) {
            if (BrowserApi.isEdge18) {
                // tslint:disable-next-line
                console.log('getBackgroundPage is null from launch guard.');
            }
            this.router.navigate(['private-mode']);
            return false;
        }

        const isAuthed = await this.userService.isAuthenticated();
        if (!isAuthed) {
            return true;
        }

        const locked = await this.vaultTimeoutService.isLocked();
        if (locked) {
            this.router.navigate(['lock']);
        } else {
            this.router.navigate(['tabs/current']);
        }

        return false;
    }
}
