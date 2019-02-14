import { BrowserApi } from '../../browser/browserApi';

import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { LockService } from 'jslib/abstractions/lock.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class LaunchGuardService implements CanActivate {
    constructor(private lockService: LockService, private userService: UserService, private router: Router) { }

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

        const locked = await this.lockService.isLocked();
        if (locked) {
            this.router.navigate(['lock']);
        } else {
            this.router.navigate(['tabs/current']);
        }

        return false;
    }
}
