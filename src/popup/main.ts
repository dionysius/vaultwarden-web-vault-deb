import 'core-js/es7/reflect';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'web-animations-js';

// tslint:disable-next-line
require('./scss/popup.scss');

import { BrowserApi } from '../browser/browserApi';
import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

function init() {
    if (BrowserApi.isEdge18) {
        const inPopup = window.location.search === '' || window.location.search.indexOf('uilocation=') === -1 ||
            window.location.search.indexOf('uilocation=popup') > -1;
        if (inPopup) {
            const bodyRect = document.querySelector('body').getBoundingClientRect();
            chrome.windows.create({
                url: 'popup/index.html?uilocation=popout',
                type: 'popup',
                width: Math.round(bodyRect.width + 60),
                height: Math.round(bodyRect.height),
            });
            BrowserApi.closePopup(window);
            return;
        }
    }

    platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
}

init();
