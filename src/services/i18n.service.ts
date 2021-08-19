import { I18nService as BaseI18nService } from 'jslib-common/services/i18n.service';

export default class I18nService extends BaseI18nService {
    constructor(systemLanguage: string) {
        super(systemLanguage, null, async (formattedLocale: string) => {
            // Deprecated
            const file = await fetch(this.localesDirectory + formattedLocale + '/messages.json');
            return await file.json();
        });

        // Please leave 'en' where it is, as it's our fallback language in case no translation can be found
        this.supportedTranslationLocales = [
            'en', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en-GB', 'en-IN', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hr', 'hu',
            'id', 'it', 'ja', 'kn', 'ko', 'lv', 'ml', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sr', 'sv', 'th', 'tr', 'uk',
            'vi', 'zh-CN', 'zh-TW',
        ];
    }

    t(id: string, p1?: string, p2?: string, p3?: string): string {
        return this.translate(id, p1, p2, p3);
    }

    translate(id: string, p1?: string, p2?: string, p3?: string): string {
        if (this.localesDirectory == null) {
            const placeholders: string[] = [];
            if (p1 != null) {
                placeholders.push(p1);
            }
            if (p2 != null) {
                placeholders.push(p2);
            }
            if (p3 != null) {
                placeholders.push(p3);
            }

            if (placeholders.length) {
                return chrome.i18n.getMessage(id, placeholders);
            } else {
                return chrome.i18n.getMessage(id);
            }
        }

        return super.translate(id, p1, p2, p3);
    }
}
