import { Injectable } from '@angular/core';

import { BrowserApi } from '../../browser/browserApi';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

@Injectable()
export class PopupUtilsService {
    constructor(private platformUtilsService: PlatformUtilsService) { }

    inSidebar(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=sidebar') > -1;
    }

    inTab(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=tab') > -1;
    }

    inPopout(win: Window): boolean {
        return win.location.search !== '' && win.location.search.indexOf('uilocation=popout') > -1;
    }

    inPopup(win: Window): boolean {
        return win.location.search === '' || win.location.search.indexOf('uilocation=') === -1 ||
            win.location.search.indexOf('uilocation=popup') > -1;
    }

    getContentScrollY(win: Window, scrollingContainer: string = 'content'): number {
        const content = win.document.getElementsByTagName(scrollingContainer)[0];
        return content.scrollTop;
    }

    setContentScrollY(win: Window, scrollY: number, scrollingContainer: string = 'content'): void {
        if (scrollY != null) {
            const content = win.document.getElementsByTagName(scrollingContainer)[0];
            content.scrollTop = scrollY;
        }
    }

    popOut(win: Window, href: string = null): void {

        if (href === null) {
            href = win.location.href;
        }

        if ((typeof chrome !== 'undefined') && chrome.windows && chrome.windows.create) {
            if (href.indexOf('?uilocation=') > -1) {
                href = href.replace('uilocation=popup', 'uilocation=popout')
                    .replace('uilocation=tab', 'uilocation=popout')
                    .replace('uilocation=sidebar', 'uilocation=popout');
            } else {
                const hrefParts = href.split('#');
                href = hrefParts[0] + '?uilocation=popout' + (hrefParts.length > 0 ? '#' + hrefParts[1] : '');
            }

            const bodyRect = document.querySelector('body').getBoundingClientRect();
            chrome.windows.create({
                url: href,
                type: 'popup',
                width: Math.round(bodyRect.width ? bodyRect.width + 60 : 375),
                height: Math.round(bodyRect.height || 600),
            });

            if (this.inPopup(win)) {
                BrowserApi.closePopup(win);
            }
        } else if ((typeof chrome !== 'undefined') && chrome.tabs && chrome.tabs.create) {
            href = href.replace('uilocation=popup', 'uilocation=tab')
                .replace('uilocation=popout', 'uilocation=tab')
                .replace('uilocation=sidebar', 'uilocation=tab');
            chrome.tabs.create({
                url: href,
            });
        }
    }
}
