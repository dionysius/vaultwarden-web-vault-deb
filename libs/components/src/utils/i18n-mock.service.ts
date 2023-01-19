import { Observable } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

export class I18nMockService implements I18nService {
  locale$: Observable<string>;
  supportedTranslationLocales: string[];
  translationLocale: string;
  collator: Intl.Collator;
  localeNames: Map<string, string>;

  constructor(private lookupTable: Record<string, string | ((...args: string[]) => string)>) {}

  t(id: string, p1?: string, p2?: string, p3?: string) {
    const value = this.lookupTable[id];
    if (typeof value == "string") {
      return value;
    }
    return value(p1, p2, p3);
  }

  translate(id: string, p1?: string, p2?: string, p3?: string) {
    return this.t(id, p1, p2, p3);
  }
}
