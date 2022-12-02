import { APP_INITIALIZER, InjectionToken, NgModule } from "@angular/core";

import {
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  CLIENT_TYPE,
  LOCALES_DIRECTORY,
  SYSTEM_LANGUAGE,
  MEMORY_STORAGE,
} from "@bitwarden/angular/services/injection-tokens";
import { JslibServicesModule } from "@bitwarden/angular/services/jslib-services.module";
import { AbstractThemingService } from "@bitwarden/angular/services/theming/theming.service.abstraction";
import { AuthService as AuthServiceAbstraction } from "@bitwarden/common/abstractions/auth.service";
import { BroadcasterService as BroadcasterServiceAbstraction } from "@bitwarden/common/abstractions/broadcaster.service";
import { CipherService as CipherServiceAbstraction } from "@bitwarden/common/abstractions/cipher.service";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import {
  LogService,
  LogService as LogServiceAbstraction,
} from "@bitwarden/common/abstractions/log.service";
import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/abstractions/login.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService as PasswordGenerationServiceAbstraction } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/abstractions/passwordReprompt.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService as PolicyServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "@bitwarden/common/abstractions/stateMigration.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { SystemService as SystemServiceAbstraction } from "@bitwarden/common/abstractions/system.service";
import { ClientType } from "@bitwarden/common/enums/clientType";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { LoginService } from "@bitwarden/common/services/login.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";
import { SystemService } from "@bitwarden/common/services/system.service";

import { Account } from "../../models/account";
import { ElectronCryptoService } from "../../services/electron-crypto.service";
import { ElectronLogService } from "../../services/electron-log.service";
import { ElectronPlatformUtilsService } from "../../services/electron-platform-utils.service";
import { ElectronRendererMessagingService } from "../../services/electron-renderer-messaging.service";
import { ElectronRendererSecureStorageService } from "../../services/electron-renderer-secure-storage.service";
import { ElectronRendererStorageService } from "../../services/electron-renderer-storage.service";
import { EncryptedMessageHandlerService } from "../../services/encrypted-message-handler.service";
import { I18nService } from "../../services/i18n.service";
import { NativeMessageHandlerService } from "../../services/native-message-handler.service";
import { NativeMessagingService } from "../../services/native-messaging.service";
import { PasswordRepromptService } from "../../services/password-reprompt.service";
import { StateService } from "../../services/state.service";
import { LoginGuard } from "../guards/login.guard";
import { SearchBarService } from "../layout/search/search-bar.service";

import { DesktopFileDownloadService } from "./desktop-file-download.service";
import { DesktopThemingService } from "./desktop-theming.service";
import { InitService } from "./init.service";

const RELOAD_CALLBACK = new InjectionToken<() => any>("RELOAD_CALLBACK");

@NgModule({
  imports: [JslibServicesModule],
  declarations: [],
  providers: [
    InitService,
    NativeMessagingService,
    SearchBarService,
    LoginGuard,
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
      provide: CLIENT_TYPE,
      useValue: ClientType.Desktop,
    },
    {
      provide: RELOAD_CALLBACK,
      useValue: null,
    },
    { provide: LogServiceAbstraction, useClass: ElectronLogService, deps: [] },
    {
      provide: PlatformUtilsServiceAbstraction,
      useClass: ElectronPlatformUtilsService,
      deps: [
        I18nServiceAbstraction,
        MessagingServiceAbstraction,
        CLIENT_TYPE,
        StateServiceAbstraction,
      ],
    },
    {
      provide: I18nServiceAbstraction,
      useClass: I18nService,
      deps: [SYSTEM_LANGUAGE, LOCALES_DIRECTORY],
    },
    {
      provide: MessagingServiceAbstraction,
      useClass: ElectronRendererMessagingService,
      deps: [BroadcasterServiceAbstraction],
    },
    { provide: AbstractStorageService, useClass: ElectronRendererStorageService },
    { provide: SECURE_STORAGE, useClass: ElectronRendererSecureStorageService },
    { provide: MEMORY_STORAGE, useClass: MemoryStorageService },
    {
      provide: CryptoServiceAbstraction,
      useClass: ElectronCryptoService,
      deps: [
        CryptoFunctionServiceAbstraction,
        EncryptService,
        PlatformUtilsServiceAbstraction,
        LogServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: SystemServiceAbstraction,
      useClass: SystemService,
      deps: [
        MessagingServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        RELOAD_CALLBACK,
        StateServiceAbstraction,
      ],
    },
    { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
    {
      provide: StateServiceAbstraction,
      useClass: StateService,
      deps: [
        AbstractStorageService,
        SECURE_STORAGE,
        MEMORY_STORAGE,
        LogService,
        StateMigrationServiceAbstraction,
        STATE_FACTORY,
        STATE_SERVICE_USE_CACHE,
      ],
    },
    {
      provide: FileDownloadService,
      useClass: DesktopFileDownloadService,
    },
    {
      provide: AbstractThemingService,
      useClass: DesktopThemingService,
    },
    {
      provide: EncryptedMessageHandlerService,
      deps: [
        StateServiceAbstraction,
        AuthServiceAbstraction,
        CipherServiceAbstraction,
        PolicyServiceAbstraction,
        MessagingServiceAbstraction,
        PasswordGenerationServiceAbstraction,
      ],
    },
    {
      provide: NativeMessageHandlerService,
      deps: [
        StateServiceAbstraction,
        CryptoServiceAbstraction,
        CryptoFunctionServiceAbstraction,
        MessagingServiceAbstraction,
        I18nServiceAbstraction,
        EncryptedMessageHandlerService,
      ],
    },
    {
      provide: LoginServiceAbstraction,
      useClass: LoginService,
    },
  ],
})
export class ServicesModule {}
