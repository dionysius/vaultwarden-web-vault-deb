import { Observable } from "rxjs";

export abstract class I18nService {
  locale$: Observable<string>;
  supportedTranslationLocales: string[];
  translationLocale: string;
  collator: Intl.Collator;
  localeNames: Map<string, string>;
  t: (id: string, p1?: string | number, p2?: string | number, p3?: string | number) => string;
  translate: (id: string, p1?: string, p2?: string, p3?: string) => string;
}
