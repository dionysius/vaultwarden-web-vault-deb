import { APP_INITIALIZER, NgModule } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { I18nServiceImplementation } from "@bitwarden/common/services/i18n.service.implementation";

import eng from "../../locales/en/messages.json";

class PreloadedEnglishI18nService extends I18nServiceImplementation {
  constructor() {
    super("en", "", () => {
      return Promise.resolve(eng);
    });
  }
}

function i18nInitializer(i18nService: I18nService): () => Promise<void> {
  return async () => {
    await (i18nService as any).init();
  };
}

// This is a helper I18nService implementation that loads the english `message.json` eliminating
//  the need for fetching them dynamically. It should only be used within storybook.
@NgModule({
  providers: [
    {
      provide: I18nService,
      useClass: PreloadedEnglishI18nService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: i18nInitializer,
      deps: [I18nService],
      multi: true,
    },
  ],
})
export class PreloadedEnglishI18nModule {}
