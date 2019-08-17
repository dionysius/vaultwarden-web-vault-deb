import { BrowserApi } from '../browser/browserApi';

import {
    BodyOutputType,
    Toast,
    ToasterConfig,
    ToasterContainerComponent,
    ToasterService,
} from 'angular2-toaster';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import swal from 'sweetalert';

import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnInit,
    SecurityContext,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
    NavigationEnd,
    Router,
    RouterOutlet,
} from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { routerTransition } from './app-routing.animations';

@Component({
    selector: 'app-root',
    styles: [],
    animations: [routerTransition],
    template: `
        <toaster-container [toasterconfig]="toasterConfig"></toaster-container>
        <main [@routerTransition]="getState(o)">
            <router-outlet #o="outlet"></router-outlet>
        </main>`,
})
export class AppComponent implements OnInit {
    toasterConfig: ToasterConfig = new ToasterConfig({
        showCloseButton: false,
        mouseoverTimerStop: true,
        animation: 'slideUp',
        limit: 2,
        positionClass: 'toast-bottom-full-width',
        newestOnTop: false,
    });

    private lastActivity: number = null;

    constructor(private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private analytics: Angulartics2,
        private toasterService: ToasterService, private storageService: StorageService,
        private broadcasterService: BroadcasterService, private authService: AuthService,
        private i18nService: I18nService, private router: Router,
        private stateService: StateService, private messagingService: MessagingService,
        private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone,
        private sanitizer: DomSanitizer, private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        if (BrowserApi.getBackgroundPage() == null) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            window.onmousemove = () => this.recordActivity();
            window.onmousedown = () => this.recordActivity();
            window.ontouchstart = () => this.recordActivity();
            window.onclick = () => this.recordActivity();
            window.onscroll = () => this.recordActivity();
            window.onkeypress = () => this.recordActivity();
        });

        (window as any).bitwardenPopupMainMessageListener = async (msg: any, sender: any, sendResponse: any) => {
            if (msg.command === 'doneLoggingOut') {
                this.ngZone.run(async () => {
                    this.authService.logOut(() => {
                        this.analytics.eventTrack.next({ action: 'Logged Out' });
                        if (msg.expired) {
                            this.showToast({
                                type: 'warning',
                                title: this.i18nService.t('loggedOut'),
                                text: this.i18nService.t('loginExpired'),
                            });
                        }
                        this.router.navigate(['home']);
                        this.stateService.purge();
                    });
                    this.changeDetectorRef.detectChanges();
                });
            }  else if (msg.command === 'authBlocked') {
                this.ngZone.run(() => {
                    this.router.navigate(['home']);
                });
            } else if (msg.command === 'locked') {
                this.stateService.purge();
                this.ngZone.run(() => {
                    this.router.navigate(['lock']);
                });
            } else if (msg.command === 'showDialog') {
                await this.showDialog(msg);
            } else if (msg.command === 'showToast') {
                this.ngZone.run(() => {
                    this.showToast(msg);
                });
            } else if (msg.command === 'analyticsEventTrack') {
                this.analytics.eventTrack.next({
                    action: msg.action,
                    properties: { label: msg.label },
                });
            } else if (msg.command === 'reloadProcess') {
                const windowReload = this.platformUtilsService.isSafari() ||
                    this.platformUtilsService.isFirefox() || this.platformUtilsService.isOpera();
                if (windowReload) {
                    // Wait to make sure background has reloaded first.
                    window.setTimeout(() => BrowserApi.reloadExtension(window), 2000);
                }
            } else if (msg.command === 'reloadPopup') {
                this.router.navigate(['/']);
            } else {
                msg.webExtSender = sender;
                this.broadcasterService.send(msg);
            }
        };

        BrowserApi.messageListener('app.component', (window as any).bitwardenPopupMainMessageListener);

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const url = event.urlAfterRedirects || event.url || '';
                if (url.startsWith('/tabs/') && (window as any).previousPopupUrl != null &&
                    (window as any).previousPopupUrl.startsWith('/tabs/')) {
                    this.stateService.remove('GroupingsComponent');
                    this.stateService.remove('CiphersComponent');
                }
                if (url.startsWith('/tabs/')) {
                    this.stateService.remove('addEditCipherInfo');
                }
                (window as any).previousPopupUrl = url;

                // Clear route direction after animation (400ms)
                if ((window as any).routeDirection != null) {
                    window.setTimeout(() => {
                        (window as any).routeDirection = null;
                    }, 400);
                }
            }
        });
    }

    getState(outlet: RouterOutlet) {
        if (BrowserApi.isEdge18) {
            return null;
        } else if (outlet.activatedRouteData.state === 'ciphers') {
            const routeDirection = (window as any).routeDirection != null ? (window as any).routeDirection : '';
            return 'ciphers_direction=' + routeDirection + '_' +
                (outlet.activatedRoute.queryParams as any).value.folderId + '_' +
                (outlet.activatedRoute.queryParams as any).value.collectionId;
        } else {
            return outlet.activatedRouteData.state;
        }
    }

    private async recordActivity() {
        const now = (new Date()).getTime();
        if (this.lastActivity != null && now - this.lastActivity < 250) {
            return;
        }

        this.lastActivity = now;
        this.storageService.save(ConstantsService.lastActiveKey, now);
    }

    private showToast(msg: any) {
        const toast: Toast = {
            type: msg.type,
            title: msg.title,
        };
        if (typeof (msg.text) === 'string') {
            toast.body = msg.text;
        } else if (msg.text.length === 1) {
            toast.body = msg.text[0];
        } else {
            let message = '';
            msg.text.forEach((t: string) =>
                message += ('<p>' + this.sanitizer.sanitize(SecurityContext.HTML, t) + '</p>'));
            toast.body = message;
            toast.bodyOutputType = BodyOutputType.TrustedHtml;
        }
        if (msg.options != null) {
            if (msg.options.trustedHtml === true) {
                toast.bodyOutputType = BodyOutputType.TrustedHtml;
            }
            if (msg.options.timeout != null && msg.options.timeout > 0) {
                toast.timeout = msg.options.timeout;
            }
        }
        this.toasterService.popAsync(toast);
    }

    private async showDialog(msg: any) {
        const buttons = [msg.confirmText == null ? this.i18nService.t('ok') : msg.confirmText];
        if (msg.cancelText != null) {
            buttons.unshift(msg.cancelText);
        }

        const contentDiv = document.createElement('div');
        if (msg.type != null) {
            const icon = document.createElement('i');
            icon.classList.add('swal-custom-icon');
            switch (msg.type) {
                case 'success':
                    icon.classList.add('fa', 'fa-check', 'text-success');
                    break;
                case 'warning':
                    icon.classList.add('fa', 'fa-warning', 'text-warning');
                    break;
                case 'error':
                    icon.classList.add('fa', 'fa-bolt', 'text-danger');
                    break;
                case 'info':
                    icon.classList.add('fa', 'fa-info-circle', 'text-info');
                    break;
                default:
                    break;
            }
            if (icon.classList.contains('fa')) {
                contentDiv.appendChild(icon);
            }
        }

        if (msg.title != null) {
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('swal-title');
            titleDiv.appendChild(document.createTextNode(msg.title));
            contentDiv.appendChild(titleDiv);
        }

        if (msg.text != null) {
            const textDiv = document.createElement('div');
            textDiv.classList.add('swal-text');
            textDiv.appendChild(document.createTextNode(msg.text));
            contentDiv.appendChild(textDiv);
        }

        const confirmed = await swal({
            content: { element: contentDiv },
            buttons: buttons,
            timer: 300000, // 5 minute timeout
        });

        this.messagingService.send('showDialogResolve', {
            dialogId: msg.dialogId,
            confirmed: confirmed,
        });
    }
}
