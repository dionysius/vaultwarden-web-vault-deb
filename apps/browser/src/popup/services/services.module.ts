import { APP_INITIALIZER, LOCALE_ID, NgModule } from "@angular/core";

import { LockGuard as BaseLockGuardService } from "@bitwarden/angular/guards/lock.guard";
import { UnauthGuard as BaseUnauthGuardService } from "@bitwarden/angular/guards/unauth.guard";
import { MEMORY_STORAGE, SECURE_STORAGE } from "@bitwarden/angular/services/injection-tokens";
import { JslibServicesModule } from "@bitwarden/angular/services/jslib-services.module";
import { ThemingService } from "@bitwarden/angular/services/theming/theming.service";
import { AbstractThemingService } from "@bitwarden/angular/services/theming/theming.service.abstraction";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AppIdService } from "@bitwarden/common/abstractions/appId.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { AuthService as AuthServiceAbstraction } from "@bitwarden/common/abstractions/auth.service";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { ConfigApiServiceAbstraction } from "@bitwarden/common/abstractions/config/config-api.service.abstraction";
import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventUploadService } from "@bitwarden/common/abstractions/event/event-upload.service";
import { ExportService } from "@bitwarden/common/abstractions/export.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { FileUploadService } from "@bitwarden/common/abstractions/fileUpload.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService as LogServiceAbstraction } from "@bitwarden/common/abstractions/log.service";
import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/abstractions/login.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { NotificationsService } from "@bitwarden/common/abstractions/notifications.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import {
  InternalPolicyService,
  PolicyService,
} from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { ProviderService } from "@bitwarden/common/abstractions/provider.service";
import { SearchService as SearchServiceAbstraction } from "@bitwarden/common/abstractions/search.service";
import { SendService } from "@bitwarden/common/abstractions/send.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import {
  StateService as BaseStateServiceAbstraction,
  StateService,
} from "@bitwarden/common/abstractions/state.service";
import { StateMigrationService } from "@bitwarden/common/abstractions/stateMigration.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
} from "@bitwarden/common/abstractions/storage.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { TwoFactorService } from "@bitwarden/common/abstractions/twoFactor.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { UsernameGenerationService } from "@bitwarden/common/abstractions/usernameGeneration.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { AuthService } from "@bitwarden/common/services/auth.service";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { LoginService } from "@bitwarden/common/services/login.service";
import { PolicyApiService } from "@bitwarden/common/services/policy/policy-api.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import {
  FolderService,
  InternalFolderService,
} from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { FolderApiService } from "@bitwarden/common/vault/services/folder/folder-api.service";

import { AutofillService } from "../../autofill/services/abstractions/autofill.service";
import MainBackground from "../../background/main.background";
import { BrowserApi } from "../../browser/browserApi";
import { Account } from "../../models/account";
import { BrowserStateService as StateServiceAbstraction } from "../../services/abstractions/browser-state.service";
import { BrowserConfigService } from "../../services/browser-config.service";
import { BrowserEnvironmentService } from "../../services/browser-environment.service";
import { BrowserI18nService } from "../../services/browser-i18n.service";
import { BrowserOrganizationService } from "../../services/browser-organization.service";
import { BrowserPolicyService } from "../../services/browser-policy.service";
import { BrowserSettingsService } from "../../services/browser-settings.service";
import { BrowserStateService } from "../../services/browser-state.service";
import { BrowserFileDownloadService } from "../../services/browserFileDownloadService";
import BrowserMessagingService from "../../services/browserMessaging.service";
import BrowserMessagingPrivateModePopupService from "../../services/browserMessagingPrivateModePopup.service";
import { PasswordRepromptService } from "../../vault/popup/services/password-reprompt.service";
import { BrowserFolderService } from "../../vault/services/browser-folder.service";
import { VaultFilterService } from "../../vault/services/vault-filter.service";

import { DebounceNavigationService } from "./debounceNavigationService";
import { InitService } from "./init.service";
import { LockGuardService } from "./lock-guard.service";
import { PopupSearchService } from "./popup-search.service";
import { PopupUtilsService } from "./popup-utils.service";
import { UnauthGuardService } from "./unauth-guard.service";

const needsBackgroundInit = BrowserApi.getBackgroundPage() == null;
const isPrivateMode = needsBackgroundInit && BrowserApi.manifestVersion !== 3;
const mainBackground: MainBackground = needsBackgroundInit
  ? createLocalBgService()
  : BrowserApi.getBackgroundPage().bitwardenMain;

function createLocalBgService() {
  const localBgService = new MainBackground(isPrivateMode);
  localBgService.bootstrap();
  return localBgService;
}

function getBgService<T>(service: keyof MainBackground) {
  return (): T => {
    return mainBackground ? (mainBackground[service] as any as T) : null;
  };
}

@NgModule({
  imports: [JslibServicesModule],
  declarations: [],
  providers: [
    InitService,
    DebounceNavigationService,
    {
      provide: LOCALE_ID,
      useFactory: () => getBgService<I18nServiceAbstraction>("i18nService")().translationLocale,
      deps: [],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (initService: InitService) => initService.init(),
      deps: [InitService],
      multi: true,
    },
    { provide: BaseLockGuardService, useClass: LockGuardService },
    { provide: BaseUnauthGuardService, useClass: UnauthGuardService },
    { provide: PopupUtilsService, useFactory: () => new PopupUtilsService(isPrivateMode) },
    {
      provide: MessagingService,
      useFactory: () => {
        return needsBackgroundInit
          ? new BrowserMessagingPrivateModePopupService()
          : new BrowserMessagingService();
      },
    },
    {
      provide: TwoFactorService,
      useFactory: getBgService<TwoFactorService>("twoFactorService"),
      deps: [],
    },
    {
      provide: AuthServiceAbstraction,
      useFactory: getBgService<AuthService>("authService"),
      deps: [],
    },
    {
      provide: SearchServiceAbstraction,
      useFactory: (
        cipherService: CipherService,
        logService: ConsoleLogService,
        i18nService: I18nServiceAbstraction
      ) => {
        return new PopupSearchService(
          getBgService<SearchService>("searchService")(),
          cipherService,
          logService,
          i18nService
        );
      },
      deps: [CipherService, LogServiceAbstraction, I18nServiceAbstraction],
    },
    { provide: AuditService, useFactory: getBgService<AuditService>("auditService"), deps: [] },
    {
      provide: FileUploadService,
      useFactory: getBgService<FileUploadService>("fileUploadService"),
      deps: [],
    },
    { provide: CipherService, useFactory: getBgService<CipherService>("cipherService"), deps: [] },
    {
      provide: CryptoFunctionService,
      useFactory: getBgService<CryptoFunctionService>("cryptoFunctionService"),
      deps: [],
    },
    {
      provide: FolderService,
      useFactory: (
        cryptoService: CryptoService,
        i18nService: I18nServiceAbstraction,
        cipherService: CipherService,
        stateService: StateServiceAbstraction
      ) => {
        return new BrowserFolderService(cryptoService, i18nService, cipherService, stateService);
      },
      deps: [CryptoService, I18nServiceAbstraction, CipherService, StateServiceAbstraction],
    },
    {
      provide: InternalFolderService,
      useExisting: FolderService,
    },
    {
      provide: FolderApiServiceAbstraction,
      useFactory: (folderService: InternalFolderService, apiService: ApiService) => {
        return new FolderApiService(folderService, apiService);
      },
      deps: [InternalFolderService, ApiService],
    },
    {
      provide: CollectionService,
      useFactory: getBgService<CollectionService>("collectionService"),
      deps: [],
    },
    {
      provide: LogServiceAbstraction,
      useFactory: getBgService<ConsoleLogService>("logService"),
      deps: [],
    },
    {
      provide: BrowserEnvironmentService,
      useExisting: EnvironmentService,
    },
    {
      provide: EnvironmentService,
      useFactory: getBgService<EnvironmentService>("environmentService"),
      deps: [],
    },
    { provide: TotpService, useFactory: getBgService<TotpService>("totpService"), deps: [] },
    { provide: TokenService, useFactory: getBgService<TokenService>("tokenService"), deps: [] },
    {
      provide: I18nServiceAbstraction,
      useFactory: (stateService: BrowserStateService) => {
        return new BrowserI18nService(BrowserApi.getUILanguage(window), stateService);
      },
      deps: [StateService],
    },
    {
      provide: CryptoService,
      useFactory: (encryptService: EncryptService) => {
        const cryptoService = getBgService<CryptoService>("cryptoService")();
        new ContainerService(cryptoService, encryptService).attachToGlobal(self);
        return cryptoService;
      },
      deps: [EncryptService],
    },
    {
      provide: EventUploadService,
      useFactory: getBgService<EventUploadService>("eventUploadService"),
      deps: [],
    },
    {
      provide: EventCollectionService,
      useFactory: getBgService<EventCollectionService>("eventCollectionService"),
      deps: [],
    },
    {
      provide: PolicyService,
      useFactory: (
        stateService: StateServiceAbstraction,
        organizationService: OrganizationService
      ) => {
        return new BrowserPolicyService(stateService, organizationService);
      },
      deps: [StateServiceAbstraction, OrganizationService],
    },
    {
      provide: PolicyApiServiceAbstraction,
      useFactory: (
        policyService: InternalPolicyService,
        apiService: ApiService,
        stateService: StateService
      ) => {
        return new PolicyApiService(policyService, apiService, stateService);
      },
      deps: [InternalPolicyService, ApiService, StateService],
    },
    {
      provide: PlatformUtilsService,
      useFactory: getBgService<PlatformUtilsService>("platformUtilsService"),
      deps: [],
    },
    {
      provide: PasswordGenerationService,
      useFactory: getBgService<PasswordGenerationService>("passwordGenerationService"),
      deps: [],
    },
    { provide: ApiService, useFactory: getBgService<ApiService>("apiService"), deps: [] },
    { provide: SyncService, useFactory: getBgService<SyncService>("syncService"), deps: [] },
    {
      provide: SettingsService,
      useFactory: (stateService: StateServiceAbstraction) => {
        return new BrowserSettingsService(stateService);
      },
      deps: [StateServiceAbstraction],
    },
    {
      provide: AbstractStorageService,
      useFactory: getBgService<AbstractStorageService>("storageService"),
      deps: [],
    },
    { provide: AppIdService, useFactory: getBgService<AppIdService>("appIdService"), deps: [] },
    {
      provide: AutofillService,
      useFactory: getBgService<AutofillService>("autofillService"),
      deps: [],
    },
    { provide: ExportService, useFactory: getBgService<ExportService>("exportService"), deps: [] },
    { provide: SendService, useFactory: getBgService<SendService>("sendService"), deps: [] },
    {
      provide: KeyConnectorService,
      useFactory: getBgService<KeyConnectorService>("keyConnectorService"),
      deps: [],
    },
    {
      provide: UserVerificationService,
      useFactory: getBgService<UserVerificationService>("userVerificationService"),
      deps: [],
    },
    {
      provide: VaultTimeoutSettingsService,
      useFactory: getBgService<VaultTimeoutSettingsService>("vaultTimeoutSettingsService"),
      deps: [],
    },
    {
      provide: VaultTimeoutService,
      useFactory: getBgService<VaultTimeoutService>("vaultTimeoutService"),
      deps: [],
    },
    {
      provide: NotificationsService,
      useFactory: getBgService<NotificationsService>("notificationsService"),
      deps: [],
    },
    {
      provide: LogServiceAbstraction,
      useFactory: getBgService<ConsoleLogService>("logService"),
      deps: [],
    },
    { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
    {
      provide: OrganizationService,
      useFactory: (stateService: StateServiceAbstraction) => {
        return new BrowserOrganizationService(stateService);
      },
      deps: [StateServiceAbstraction],
    },
    {
      provide: VaultFilterService,
      useFactory: (
        stateService: StateServiceAbstraction,
        organizationService: OrganizationService,
        folderService: FolderService,
        policyService: PolicyService
      ) => {
        return new VaultFilterService(
          stateService,
          organizationService,
          folderService,
          getBgService<CipherService>("cipherService")(),
          getBgService<CollectionService>("collectionService")(),
          policyService
        );
      },
      deps: [StateServiceAbstraction, OrganizationService, FolderService, PolicyService],
    },
    {
      provide: ProviderService,
      useFactory: getBgService<ProviderService>("providerService"),
      deps: [],
    },
    {
      provide: SECURE_STORAGE,
      useFactory: getBgService<AbstractStorageService>("secureStorageService"),
      deps: [],
    },
    {
      provide: MEMORY_STORAGE,
      useFactory: getBgService<AbstractStorageService>("memoryStorageService"),
    },
    {
      provide: StateMigrationService,
      useFactory: getBgService<StateMigrationService>("stateMigrationService"),
      deps: [],
    },
    {
      provide: StateServiceAbstraction,
      useFactory: (
        storageService: AbstractStorageService,
        secureStorageService: AbstractStorageService,
        memoryStorageService: AbstractMemoryStorageService,
        logService: LogServiceAbstraction,
        stateMigrationService: StateMigrationService
      ) => {
        return new BrowserStateService(
          storageService,
          secureStorageService,
          memoryStorageService,
          logService,
          stateMigrationService,
          new StateFactory(GlobalState, Account)
        );
      },
      deps: [
        AbstractStorageService,
        SECURE_STORAGE,
        MEMORY_STORAGE,
        LogServiceAbstraction,
        StateMigrationService,
      ],
    },
    {
      provide: UsernameGenerationService,
      useFactory: getBgService<UsernameGenerationService>("usernameGenerationService"),
      deps: [],
    },
    {
      provide: BaseStateServiceAbstraction,
      useExisting: StateServiceAbstraction,
      deps: [],
    },
    {
      provide: FileDownloadService,
      useClass: BrowserFileDownloadService,
    },
    {
      provide: LoginServiceAbstraction,
      useClass: LoginService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: AbstractThemingService,
      useFactory: (
        stateService: StateServiceAbstraction,
        platformUtilsService: PlatformUtilsService
      ) => {
        return new ThemingService(
          stateService,
          // Safari doesn't properly handle the (prefers-color-scheme) media query in the popup window, it always returns light.
          // In Safari we have to use the background page instead, which comes with limitations like not dynamically changing the extension theme when the system theme is changed.
          platformUtilsService.isSafari() ? getBgService<Window>("backgroundWindow")() : window,
          document
        );
      },
      deps: [StateServiceAbstraction, PlatformUtilsService],
    },
    {
      provide: ConfigServiceAbstraction,
      useClass: BrowserConfigService,
      deps: [StateServiceAbstraction, ConfigApiServiceAbstraction],
    },
  ],
})
export class ServicesModule {}
