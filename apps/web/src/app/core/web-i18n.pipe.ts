import { Pipe } from "@angular/core";

import { I18nPipe } from "@bitwarden/angular/pipes/i18n.pipe";

import { WebI18nKey } from "./web-i18n.service.implementation";

@Pipe({
  name: "i18n",
})
export class WebI18nPipe extends I18nPipe<WebI18nKey> {}
