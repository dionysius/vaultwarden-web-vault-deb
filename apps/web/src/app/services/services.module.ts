import { APP_INITIALIZER, NgModule } from "@angular/core";
import { ToastrModule } from "ngx-toastr";

import {
  JslibServicesModule,
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  LOCALES_DIRECTORY,
  SYSTEM_LANGUAGE,
  MEMORY_STORAGE,
} from "@bitwarden/angular/services/jslib-services.module";
import { ModalService as ModalServiceAbstraction } from "@bitwarden/angular/services/modal.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService as BaseStateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "@bitwarden/common/abstractions/stateMigration.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import { HomeGuard } from "../guards/home.guard";
import { Account } from "../models/account";
import { GlobalState } from "../models/globalState";
import { PermissionsGuard as OrgPermissionsGuard } from "../organizations/guards/permissions.guard";
import { NavigationPermissionsService as OrgPermissionsService } from "../organizations/services/navigation-permissions.service";

import { BroadcasterMessagingService } from "./broadcasterMessaging.service";
import { EventService } from "./event.service";
import { HtmlStorageService } from "./htmlStorage.service";
import { I18nService } from "./i18n.service";
import { InitService } from "./init.service";
import { ModalService } from "./modal.service";
import { PasswordRepromptService } from "./passwordReprompt.service";
import { PolicyListService } from "./policy-list.service";
import { RouterService } from "./router.service";
import { StateService } from "./state.service";
import { StateMigrationService } from "./stateMigration.service";
import { WebFileDownloadService } from "./webFileDownload.service";
import { WebPlatformUtilsService } from "./webPlatformUtils.service";

@NgModule({
  imports: [ToastrModule, JslibServicesModule],
  declarations: [],
  providers: [
    OrgPermissionsService,
    OrgPermissionsGuard,
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
    HomeGuard,
  ],
})
export class ServicesModule {}
