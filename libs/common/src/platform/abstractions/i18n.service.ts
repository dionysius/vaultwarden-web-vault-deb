import { Observable } from "rxjs";

import { TranslationService } from "./translation.service";

export abstract class I18nService extends TranslationService {
  locale$: Observable<string>;
  abstract setLocale(locale: string): Promise<void>;
}
