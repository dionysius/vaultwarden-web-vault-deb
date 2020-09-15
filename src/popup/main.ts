import 'core-js/es7/reflect';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'web-animations-js';

// tslint:disable-next-line
require('./scss/popup.scss');

import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

function init() {
    platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
}

init();
