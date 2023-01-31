import { CommonModule } from "@angular/common";
import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from "@angular/core";

import {
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  LOCALES_DIRECTORY,
  SYSTEM_LANGUAGE,
  MEMORY_STORAGE,
} from "@bitwarden/angular/services/injection-tokens";
import { JslibServicesModule } from "@bitwarden/angular/services/jslib-services.module";
import { ModalService as ModalServiceAbstraction } from "@bitwarden/angular/services/modal.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/abstractions/login.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService as BaseStateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "@bitwarden/common/abstractions/stateMigration.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { LoginService } from "@bitwarden/common/services/login.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/vault/abstractions/password-reprompt.service";

// TODO refine elsint rule for **/app/core/*
// eslint-disable-next-line no-restricted-imports
import { PasswordRepromptService } from "../../vault/app/core/password-reprompt.service";

import { BroadcasterMessagingService } from "./broadcaster-messaging.service";
import { EventService } from "./event.service";
import { HtmlStorageService } from "./html-storage.service";
import { I18nService } from "./i18n.service";
import { InitService } from "./init.service";
import { ModalService } from "./modal.service";
import { PolicyListService } from "./policy-list.service";
import { RouterService } from "./router.service";
import { Account, GlobalState, StateService } from "./state";
import { StateMigrationService } from "./state-migration.service";
import { WebFileDownloadService } from "./web-file-download.service";
import { WebPlatformUtilsService } from "./web-platform-utils.service";

@NgModule({
  declarations: [],
  imports: [CommonModule, JslibServicesModule],
  providers: [
    InitService,
    RouterService,
    EventService,
    PolicyListService,
    {
      provide: APP_INITIALIZER,
      useFactory: (initService: InitService) => initService.init(),
      deps: [InitService],
      multi: true,
    },
    {
      provide: STATE_FACTORY,
      useValue: new StateFactory(GlobalState, Account),
    },
    {
      provide: STATE_SERVICE_USE_CACHE,
      useValue: false,
    },
    {
      provide: I18nServiceAbstraction,
      useClass: I18nService,
      deps: [SYSTEM_LANGUAGE, LOCALES_DIRECTORY],
    },
    { provide: AbstractStorageService, useClass: HtmlStorageService },
    {
      provide: SECURE_STORAGE,
      // TODO: platformUtilsService.isDev has a helper for this, but using that service here results in a circular dependency.
      // We have a tech debt item in the backlog to break up platformUtilsService, but in the meantime simply checking the environement here is less cumbersome.
      useClass: process.env.NODE_ENV === "development" ? HtmlStorageService : MemoryStorageService,
    },
    {
      provide: MEMORY_STORAGE,
      useClass: MemoryStorageService,
    },
    {
      provide: PlatformUtilsServiceAbstraction,
      useClass: WebPlatformUtilsService,
    },
    { provide: MessagingServiceAbstraction, useClass: BroadcasterMessagingService },
    { provide: ModalServiceAbstraction, useClass: ModalService },
    {
      provide: StateMigrationServiceAbstraction,
      useClass: StateMigrationService,
      deps: [AbstractStorageService, SECURE_STORAGE, STATE_FACTORY],
    },
    StateService,
    {
      provide: BaseStateServiceAbstraction,
      useExisting: StateService,
    },
    {
      provide: PasswordRepromptServiceAbstraction,
      useClass: PasswordRepromptService,
    },
    {
      provide: FileDownloadService,
      useClass: WebFileDownloadService,
    },
    {
      provide: LoginServiceAbstraction,
      useClass: LoginService,
      deps: [StateService],
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error("CoreModule is already loaded. Import it in the AppModule only");
    }
  }
}
