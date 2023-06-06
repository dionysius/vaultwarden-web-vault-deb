import { Observable, ReplaySubject } from "rxjs";

import { I18nService as I18nServiceAbstraction } from "../abstractions/i18n.service";

import { TranslationService } from "./translation.service";

export class I18nService extends TranslationService implements I18nServiceAbstraction {
  protected _locale = new ReplaySubject<string>(1);
  private _translationLocale: string;
  locale$: Observable<string> = this._locale.asObservable();

  constructor(
    protected systemLanguage: string,
    protected localesDirectory: string,
    protected getLocalesJson: (formattedLocale: string) => Promise<any>
  ) {
    super(systemLanguage, localesDirectory, getLocalesJson);
  }

  get translationLocale(): string {
    return this._translationLocale;
  }

  set translationLocale(locale: string) {
    this._translationLocale = locale;
    this._locale.next(locale);
  }
}
