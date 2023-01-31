import { Injector, LOCALE_ID, NgModule } from "@angular/core";

import { AccountApiService as AccountApiServiceAbstraction } from "@bitwarden/common/abstractions/account/account-api.service";
import {
  AccountService as AccountServiceAbstraction,
  InternalAccountService,
} from "@bitwarden/common/abstractions/account/account.service";
import { AvatarUpdateService as AccountUpdateServiceAbstraction } from "@bitwarden/common/abstractions/account/avatar-update.service";
import { AnonymousHubService as AnonymousHubServiceAbstraction } from "@bitwarden/common/abstractions/anonymousHub.service";
import { ApiService as ApiServiceAbstraction } from "@bitwarden/common/abstractions/api.service";
import { AppIdService as AppIdServiceAbstraction } from "@bitwarden/common/abstractions/appId.service";
import { AuditService as AuditServiceAbstraction } from "@bitwarden/common/abstractions/audit.service";
import { AuthService as AuthServiceAbstraction } from "@bitwarden/common/abstractions/auth.service";
import { BroadcasterService as BroadcasterServiceAbstraction } from "@bitwarden/common/abstractions/broadcaster.service";
import { CollectionService as CollectionServiceAbstraction } from "@bitwarden/common/abstractions/collection.service";
import { ConfigApiServiceAbstraction } from "@bitwarden/common/abstractions/config/config-api.service.abstraction";
import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { CryptoService as CryptoServiceAbstraction } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { EnvironmentService as EnvironmentServiceAbstraction } from "@bitwarden/common/abstractions/environment.service";
import { EventCollectionService as EventCollectionServiceAbstraction } from "@bitwarden/common/abstractions/event/event-collection.service";
import { EventUploadService as EventUploadServiceAbstraction } from "@bitwarden/common/abstractions/event/event-upload.service";
import { ExportService as ExportServiceAbstraction } from "@bitwarden/common/abstractions/export.service";
import { FileUploadService as FileUploadServiceAbstraction } from "@bitwarden/common/abstractions/fileUpload.service";
import { FormValidationErrorsService as FormValidationErrorsServiceAbstraction } from "@bitwarden/common/abstractions/formValidationErrors.service";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/abstractions/i18n.service";
import { KeyConnectorService as KeyConnectorServiceAbstraction } from "@bitwarden/common/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LoginService as LoginServiceAbstraction } from "@bitwarden/common/abstractions/login.service";
import { MessagingService as MessagingServiceAbstraction } from "@bitwarden/common/abstractions/messaging.service";
import { NotificationsService as NotificationsServiceAbstraction } from "@bitwarden/common/abstractions/notifications.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import {
  InternalOrganizationService,
  OrganizationService as OrganizationServiceAbstraction,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordGenerationService as PasswordGenerationServiceAbstraction } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import {
  InternalPolicyService,
  PolicyService as PolicyServiceAbstraction,
} from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { ProviderService as ProviderServiceAbstraction } from "@bitwarden/common/abstractions/provider.service";
import { SearchService as SearchServiceAbstraction } from "@bitwarden/common/abstractions/search.service";
import { SendService as SendServiceAbstraction } from "@bitwarden/common/abstractions/send.service";
import { SettingsService as SettingsServiceAbstraction } from "@bitwarden/common/abstractions/settings.service";
import { StateService as StateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "@bitwarden/common/abstractions/stateMigration.service";
import { AbstractStorageService } from "@bitwarden/common/abstractions/storage.service";
import { TokenService as TokenServiceAbstraction } from "@bitwarden/common/abstractions/token.service";
import { TotpService as TotpServiceAbstraction } from "@bitwarden/common/abstractions/totp.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "@bitwarden/common/abstractions/twoFactor.service";
import { UserVerificationApiServiceAbstraction } from "@bitwarden/common/abstractions/userVerification/userVerification-api.service.abstraction";
import { UserVerificationService as UserVerificationServiceAbstraction } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { UsernameGenerationService as UsernameGenerationServiceAbstraction } from "@bitwarden/common/abstractions/usernameGeneration.service";
import { ValidationService as ValidationServiceAbstraction } from "@bitwarden/common/abstractions/validation.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService as VaultTimeoutSettingsServiceAbstraction } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { flagEnabled } from "@bitwarden/common/misc/flags";
import { Account } from "@bitwarden/common/models/domain/account";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { AccountApiServiceImplementation } from "@bitwarden/common/services/account/account-api.service";
import { AccountServiceImplementation } from "@bitwarden/common/services/account/account.service";
import { AvatarUpdateService } from "@bitwarden/common/services/account/avatar-update.service";
import { AnonymousHubService } from "@bitwarden/common/services/anonymousHub.service";
import { ApiService } from "@bitwarden/common/services/api.service";
import { AppIdService } from "@bitwarden/common/services/appId.service";
import { AuditService } from "@bitwarden/common/services/audit.service";
import { AuthService } from "@bitwarden/common/services/auth.service";
import { CollectionService } from "@bitwarden/common/services/collection.service";
import { ConfigApiService } from "@bitwarden/common/services/config/config-api.service";
import { ConfigService } from "@bitwarden/common/services/config/config.service";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { CryptoService } from "@bitwarden/common/services/crypto.service";
import { EncryptServiceImplementation } from "@bitwarden/common/services/cryptography/encrypt.service.implementation";
import { MultithreadEncryptServiceImplementation } from "@bitwarden/common/services/cryptography/multithread-encrypt.service.implementation";
import { EnvironmentService } from "@bitwarden/common/services/environment.service";
import { EventCollectionService } from "@bitwarden/common/services/event/event-collection.service";
import { EventUploadService } from "@bitwarden/common/services/event/event-upload.service";
import { ExportService } from "@bitwarden/common/services/export.service";
import { FileUploadService } from "@bitwarden/common/services/fileUpload.service";
import { FormValidationErrorsService } from "@bitwarden/common/services/formValidationErrors.service";
import { KeyConnectorService } from "@bitwarden/common/services/keyConnector.service";
import { LoginService } from "@bitwarden/common/services/login.service";
import { NotificationsService } from "@bitwarden/common/services/notifications.service";
import { OrganizationUserServiceImplementation } from "@bitwarden/common/services/organization-user/organization-user.service.implementation";
import { OrganizationApiService } from "@bitwarden/common/services/organization/organization-api.service";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";
import { PasswordGenerationService } from "@bitwarden/common/services/passwordGeneration.service";
import { PolicyApiService } from "@bitwarden/common/services/policy/policy-api.service";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";
import { ProviderService } from "@bitwarden/common/services/provider.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { SendService } from "@bitwarden/common/services/send.service";
import { SettingsService } from "@bitwarden/common/services/settings.service";
import { StateService } from "@bitwarden/common/services/state.service";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";
import { TokenService } from "@bitwarden/common/services/token.service";
import { TotpService } from "@bitwarden/common/services/totp.service";
import { TwoFactorService } from "@bitwarden/common/services/twoFactor.service";
import { UserVerificationApiService } from "@bitwarden/common/services/userVerification/userVerification-api.service";
import { UserVerificationService } from "@bitwarden/common/services/userVerification/userVerification.service";
import { UsernameGenerationService } from "@bitwarden/common/services/usernameGeneration.service";
import { ValidationService } from "@bitwarden/common/services/validation.service";
import { VaultTimeoutService } from "@bitwarden/common/services/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/services/vaultTimeout/vaultTimeoutSettings.service";
import { WebCryptoFunctionService } from "@bitwarden/common/services/webCryptoFunction.service";
import { CipherService as CipherServiceAbstraction } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import {
  FolderService as FolderServiceAbstraction,
  InternalFolderService,
} from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { SyncNotifierService as SyncNotifierServiceAbstraction } from "@bitwarden/common/vault/abstractions/sync/sync-notifier.service.abstraction";
import { SyncService as SyncServiceAbstraction } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { FolderApiService } from "@bitwarden/common/vault/services/folder/folder-api.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";
import { SyncNotifierService } from "@bitwarden/common/vault/services/sync/sync-notifier.service";
import { SyncService } from "@bitwarden/common/vault/services/sync/sync.service";

import { AuthGuard } from "../guards/auth.guard";
import { LockGuard } from "../guards/lock.guard";
import { UnauthGuard } from "../guards/unauth.guard";
import { PasswordRepromptService } from "../vault/services/password-reprompt.service";

import { BroadcasterService } from "./broadcaster.service";
import {
  LOCALES_DIRECTORY,
  LOCKED_CALLBACK,
  LOG_MAC_FAILURES,
  LOGOUT_CALLBACK,
  MEMORY_STORAGE,
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  SYSTEM_LANGUAGE,
  WINDOW,
} from "./injection-tokens";
import { ModalService } from "./modal.service";
import { ThemingService } from "./theming/theming.service";
import { AbstractThemingService } from "./theming/theming.service.abstraction";

@NgModule({
  declarations: [],
  providers: [
    AuthGuard,
    UnauthGuard,
    LockGuard,
    ModalService,
    { provide: WINDOW, useValue: window },
    {
      provide: LOCALE_ID,
      useFactory: (i18nService: I18nServiceAbstraction) => i18nService.translationLocale,
      deps: [I18nServiceAbstraction],
    },
    {
      provide: LOCALES_DIRECTORY,
      useValue: "./locales",
    },
    {
      provide: SYSTEM_LANGUAGE,
      useFactory: (window: Window) => window.navigator.language,
      deps: [WINDOW],
    },
    {
      provide: STATE_FACTORY,
      useValue: new StateFactory(GlobalState, Account),
    },
    {
      provide: STATE_SERVICE_USE_CACHE,
      useValue: true,
    },
    {
      provide: LOGOUT_CALLBACK,
      useFactory:
        (messagingService: MessagingServiceAbstraction) => (expired: boolean, userId?: string) =>
          messagingService.send("logout", { expired: expired, userId: userId }),
      deps: [MessagingServiceAbstraction],
    },
    {
      provide: LOCKED_CALLBACK,
      useValue: null,
    },
    {
      provide: LOG_MAC_FAILURES,
      useValue: true,
    },
    {
      provide: AppIdServiceAbstraction,
      useClass: AppIdService,
      deps: [AbstractStorageService],
    },
    {
      provide: AuditServiceAbstraction,
      useClass: AuditService,
      deps: [CryptoFunctionServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: AuthServiceAbstraction,
      useClass: AuthService,
      deps: [
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        TokenServiceAbstraction,
        AppIdServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        MessagingServiceAbstraction,
        LogService,
        KeyConnectorServiceAbstraction,
        EnvironmentServiceAbstraction,
        StateServiceAbstraction,
        TwoFactorServiceAbstraction,
        I18nServiceAbstraction,
      ],
    },
    {
      provide: CipherServiceAbstraction,
      useFactory: (
        cryptoService: CryptoServiceAbstraction,
        settingsService: SettingsServiceAbstraction,
        apiService: ApiServiceAbstraction,
        fileUploadService: FileUploadServiceAbstraction,
        i18nService: I18nServiceAbstraction,
        injector: Injector,
        logService: LogService,
        stateService: StateServiceAbstraction,
        encryptService: EncryptService
      ) =>
        new CipherService(
          cryptoService,
          settingsService,
          apiService,
          fileUploadService,
          i18nService,
          () => injector.get(SearchServiceAbstraction),
          logService,
          stateService,
          encryptService
        ),
      deps: [
        CryptoServiceAbstraction,
        SettingsServiceAbstraction,
        ApiServiceAbstraction,
        FileUploadServiceAbstraction,
        I18nServiceAbstraction,
        Injector, // TODO: Get rid of this circular dependency!
        LogService,
        StateServiceAbstraction,
        EncryptService,
      ],
    },
    {
      provide: FolderServiceAbstraction,
      useClass: FolderService,
      deps: [
        CryptoServiceAbstraction,
        I18nServiceAbstraction,
        CipherServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: InternalFolderService,
      useExisting: FolderServiceAbstraction,
    },
    {
      provide: FolderApiServiceAbstraction,
      useClass: FolderApiService,
      deps: [FolderServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: AccountApiServiceAbstraction,
      useClass: AccountApiServiceImplementation,
      deps: [
        ApiServiceAbstraction,
        UserVerificationServiceAbstraction,
        LogService,
        InternalAccountService,
      ],
    },
    {
      provide: AccountServiceAbstraction,
      useClass: AccountServiceImplementation,
      deps: [MessagingServiceAbstraction, LogService],
    },
    {
      provide: InternalAccountService,
      useExisting: AccountServiceAbstraction,
    },
    {
      provide: AccountUpdateServiceAbstraction,
      useClass: AvatarUpdateService,
      deps: [ApiServiceAbstraction, StateServiceAbstraction],
    },
    { provide: LogService, useFactory: () => new ConsoleLogService(false) },
    {
      provide: CollectionServiceAbstraction,
      useClass: CollectionService,
      deps: [CryptoServiceAbstraction, I18nServiceAbstraction, StateServiceAbstraction],
    },
    {
      provide: EnvironmentServiceAbstraction,
      useClass: EnvironmentService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: TotpServiceAbstraction,
      useClass: TotpService,
      deps: [CryptoFunctionServiceAbstraction, LogService, StateServiceAbstraction],
    },
    { provide: TokenServiceAbstraction, useClass: TokenService, deps: [StateServiceAbstraction] },
    {
      provide: CryptoServiceAbstraction,
      useClass: CryptoService,
      deps: [
        CryptoFunctionServiceAbstraction,
        EncryptService,
        PlatformUtilsServiceAbstraction,
        LogService,
        StateServiceAbstraction,
      ],
    },
    {
      provide: PasswordGenerationServiceAbstraction,
      useClass: PasswordGenerationService,
      deps: [CryptoServiceAbstraction, PolicyServiceAbstraction, StateServiceAbstraction],
    },
    {
      provide: UsernameGenerationServiceAbstraction,
      useClass: UsernameGenerationService,
      deps: [CryptoServiceAbstraction, StateServiceAbstraction, ApiServiceAbstraction],
    },
    {
      provide: ApiServiceAbstraction,
      useClass: ApiService,
      deps: [
        TokenServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        EnvironmentServiceAbstraction,
        AppIdServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    {
      provide: FileUploadServiceAbstraction,
      useClass: FileUploadService,
      deps: [LogService, ApiServiceAbstraction],
    },
    {
      provide: SyncServiceAbstraction,
      useClass: SyncService,
      deps: [
        ApiServiceAbstraction,
        SettingsServiceAbstraction,
        FolderServiceAbstraction,
        CipherServiceAbstraction,
        CryptoServiceAbstraction,
        CollectionServiceAbstraction,
        MessagingServiceAbstraction,
        PolicyServiceAbstraction,
        SendServiceAbstraction,
        LogService,
        KeyConnectorServiceAbstraction,
        StateServiceAbstraction,
        ProviderServiceAbstraction,
        FolderApiServiceAbstraction,
        OrganizationServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    { provide: BroadcasterServiceAbstraction, useClass: BroadcasterService },
    {
      provide: SettingsServiceAbstraction,
      useClass: SettingsService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: VaultTimeoutSettingsServiceAbstraction,
      useClass: VaultTimeoutSettingsService,
      deps: [
        CryptoServiceAbstraction,
        TokenServiceAbstraction,
        PolicyServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: VaultTimeoutServiceAbstraction,
      useClass: VaultTimeoutService,
      deps: [
        CipherServiceAbstraction,
        FolderServiceAbstraction,
        CollectionServiceAbstraction,
        CryptoServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        MessagingServiceAbstraction,
        SearchServiceAbstraction,
        KeyConnectorServiceAbstraction,
        StateServiceAbstraction,
        AuthServiceAbstraction,
        VaultTimeoutSettingsServiceAbstraction,
        LOCKED_CALLBACK,
        LOGOUT_CALLBACK,
      ],
    },
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
      provide: StateMigrationServiceAbstraction,
      useClass: StateMigrationService,
      deps: [AbstractStorageService, SECURE_STORAGE, STATE_FACTORY],
    },
    {
      provide: ExportServiceAbstraction,
      useClass: ExportService,
      deps: [
        FolderServiceAbstraction,
        CipherServiceAbstraction,
        ApiServiceAbstraction,
        CryptoServiceAbstraction,
        CryptoFunctionServiceAbstraction,
      ],
    },
    {
      provide: SearchServiceAbstraction,
      useClass: SearchService,
      deps: [CipherServiceAbstraction, LogService, I18nServiceAbstraction],
    },
    {
      provide: NotificationsServiceAbstraction,
      useClass: NotificationsService,
      deps: [
        SyncServiceAbstraction,
        AppIdServiceAbstraction,
        ApiServiceAbstraction,
        EnvironmentServiceAbstraction,
        LOGOUT_CALLBACK,
        LogService,
        StateServiceAbstraction,
        AuthServiceAbstraction,
      ],
    },
    {
      provide: CryptoFunctionServiceAbstraction,
      useClass: WebCryptoFunctionService,
      deps: [WINDOW],
    },
    {
      provide: EncryptService,
      useFactory: encryptServiceFactory,
      deps: [CryptoFunctionServiceAbstraction, LogService, LOG_MAC_FAILURES],
    },
    {
      provide: EventUploadServiceAbstraction,
      useClass: EventUploadService,
      deps: [ApiServiceAbstraction, StateServiceAbstraction, LogService],
    },
    {
      provide: EventCollectionServiceAbstraction,
      useClass: EventCollectionService,
      deps: [
        CipherServiceAbstraction,
        StateServiceAbstraction,
        OrganizationServiceAbstraction,
        EventUploadServiceAbstraction,
      ],
    },
    {
      provide: PolicyServiceAbstraction,
      useClass: PolicyService,
      deps: [StateServiceAbstraction, OrganizationServiceAbstraction],
    },
    {
      provide: InternalPolicyService,
      useExisting: PolicyServiceAbstraction,
    },
    {
      provide: PolicyApiServiceAbstraction,
      useClass: PolicyApiService,
      deps: [PolicyServiceAbstraction, ApiServiceAbstraction, StateServiceAbstraction],
    },
    {
      provide: SendServiceAbstraction,
      useClass: SendService,
      deps: [
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        FileUploadServiceAbstraction,
        I18nServiceAbstraction,
        CryptoFunctionServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: KeyConnectorServiceAbstraction,
      useClass: KeyConnectorService,
      deps: [
        StateServiceAbstraction,
        CryptoServiceAbstraction,
        ApiServiceAbstraction,
        TokenServiceAbstraction,
        LogService,
        OrganizationServiceAbstraction,
        CryptoFunctionServiceAbstraction,
        SyncNotifierServiceAbstraction,
        MessagingServiceAbstraction,
        LOGOUT_CALLBACK,
      ],
    },
    {
      provide: UserVerificationServiceAbstraction,
      useClass: UserVerificationService,
      deps: [
        CryptoServiceAbstraction,
        I18nServiceAbstraction,
        UserVerificationApiServiceAbstraction,
      ],
    },
    { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
    {
      provide: OrganizationServiceAbstraction,
      useClass: OrganizationService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: InternalOrganizationService,
      useExisting: OrganizationServiceAbstraction,
    },
    {
      provide: OrganizationUserService,
      useClass: OrganizationUserServiceImplementation,
      deps: [ApiServiceAbstraction],
    },
    {
      provide: ProviderServiceAbstraction,
      useClass: ProviderService,
      deps: [StateServiceAbstraction],
    },
    {
      provide: TwoFactorServiceAbstraction,
      useClass: TwoFactorService,
      deps: [I18nServiceAbstraction, PlatformUtilsServiceAbstraction],
    },
    {
      provide: AbstractThemingService,
      useClass: ThemingService,
    },
    {
      provide: FormValidationErrorsServiceAbstraction,
      useClass: FormValidationErrorsService,
    },
    {
      provide: UserVerificationApiServiceAbstraction,
      useClass: UserVerificationApiService,
      deps: [ApiServiceAbstraction],
    },
    {
      provide: OrganizationApiServiceAbstraction,
      useClass: OrganizationApiService,
      // This is a slightly odd dependency tree for a specialized api service
      // it depends on SyncService so that new data can be retrieved through the sync
      // rather than updating the OrganizationService directly. Instead OrganizationService
      // subscribes to sync notifications and will update itself based on that.
      deps: [ApiServiceAbstraction, SyncServiceAbstraction],
    },
    {
      provide: SyncNotifierServiceAbstraction,
      useClass: SyncNotifierService,
    },
    {
      provide: ConfigServiceAbstraction,
      useClass: ConfigService,
      deps: [StateServiceAbstraction, ConfigApiServiceAbstraction],
    },
    {
      provide: ConfigApiServiceAbstraction,
      useClass: ConfigApiService,
      deps: [ApiServiceAbstraction],
    },
    {
      provide: AnonymousHubServiceAbstraction,
      useClass: AnonymousHubService,
      deps: [EnvironmentServiceAbstraction, AuthServiceAbstraction, LogService],
    },
    {
      provide: ValidationServiceAbstraction,
      useClass: ValidationService,
      deps: [I18nServiceAbstraction, PlatformUtilsServiceAbstraction],
    },
    {
      provide: LoginServiceAbstraction,
      useClass: LoginService,
      deps: [StateServiceAbstraction],
    },
  ],
})
export class JslibServicesModule {}

function encryptServiceFactory(
  cryptoFunctionservice: CryptoFunctionServiceAbstraction,
  logService: LogService,
  logMacFailures: boolean
): EncryptService {
  return flagEnabled("multithreadDecryption")
    ? new MultithreadEncryptServiceImplementation(cryptoFunctionservice, logService, logMacFailures)
    : new EncryptServiceImplementation(cryptoFunctionservice, logService, logMacFailures);
}
