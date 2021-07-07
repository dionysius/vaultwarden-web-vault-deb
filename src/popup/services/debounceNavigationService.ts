import {
    Injectable,
    OnDestroy
} from '@angular/core';
import {
    CanActivate,
    NavigationEnd,
    NavigationStart,
    Router,
} from '@angular/router';

import { Subscription } from 'rxjs';
import {
    filter,
    pairwise,
} from 'rxjs/operators';

@Injectable()
export class DebounceNavigationService implements CanActivate, OnDestroy {
    navigationStartSub: Subscription;
    navigationSuccessSub: Subscription;

    private lastNavigation: NavigationStart;
    private thisNavigation: NavigationStart;
    private lastNavigationSuccessId: number;

    constructor(private router: Router) {
        this.navigationStartSub = this.router.events
            .pipe(filter(event => event instanceof NavigationStart), pairwise())
            .subscribe((events: [NavigationStart, NavigationStart]) => [this.lastNavigation, this.thisNavigation] = events);

        this.navigationSuccessSub = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => this.lastNavigationSuccessId = event.id);
    }

    async canActivate() {
        return !(this.thisNavigation?.navigationTrigger === 'hashchange' &&
            this.lastNavigation.navigationTrigger === 'popstate' &&
            this.lastNavigationSuccessId === this.lastNavigation.id &&
            this.lastNavigation.url === this.thisNavigation?.url);
    }

    ngOnDestroy() {
        if (this.navigationStartSub != null) {
            this.navigationStartSub.unsubscribe();
        }

        if (this.navigationSuccessSub != null) {
            this.navigationSuccessSub.unsubscribe();
        }
    }
}
