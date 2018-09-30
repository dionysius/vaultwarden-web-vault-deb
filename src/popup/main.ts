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

function bootstrapModule() {
    platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
}

// Bug in Edge 18 has null getBackgroundPage() result initially. Can be removed in future.
if (BrowserApi.getBackgroundPage() == null && BrowserApi.isEdge18) {
    const sleep = (time: number) => new Promise((resolve) => window.setTimeout(resolve, time));
    const bootstrapForEdge18 = async () => {
        let bgAttempts = 1;
        while (BrowserApi.getBackgroundPage() == null) {
            if (bgAttempts > 30) {
                break;
            }
            // tslint:disable-next-line
            console.log('Waiting for background page to not be null. Attempt #' + bgAttempts);
            await sleep(200);
            bgAttempts++;
        }
        if (BrowserApi.getBackgroundPage() == null) {
            // tslint:disable-next-line
            console.log('Reload page.');
            window.location.reload();
        } else {
            bootstrapModule();
        }
    };
    bootstrapForEdge18();
} else {
    if (BrowserApi.isEdge18) {
        // tslint:disable-next-line
        console.log('Normal bootstrap.');
    }
    bootstrapModule();
}
