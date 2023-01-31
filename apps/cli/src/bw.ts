import * as fs from "fs";
import * as path from "path";

import * as program from "commander";
import * as jsdom from "jsdom";

import { ImportApiServiceAbstraction } from "@bitwarden/common/abstractions/import/import-api.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { ClientType } from "@bitwarden/common/enums/clientType";
import { KeySuffixOptions } from "@bitwarden/common/enums/keySuffixOptions";
import { LogLevelType } from "@bitwarden/common/enums/logLevelType";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { Account } from "@bitwarden/common/models/domain/account";
import { GlobalState } from "@bitwarden/common/models/domain/global-state";
import { AppIdService } from "@bitwarden/common/services/appId.service";
import { AuditService } from "@bitwarden/common/services/audit.service";
import { AuthService } from "@bitwarden/common/services/auth.service";
import { BroadcasterService } from "@bitwarden/common/services/broadcaster.service";
import { CollectionService } from "@bitwarden/common/services/collection.service";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { CryptoService } from "@bitwarden/common/services/crypto.service";
import { EncryptServiceImplementation } from "@bitwarden/common/services/cryptography/encrypt.service.implementation";
import { EnvironmentService } from "@bitwarden/common/services/environment.service";
import { ExportService } from "@bitwarden/common/services/export.service";
import { FileUploadService } from "@bitwarden/common/services/fileUpload.service";
import { ImportApiService } from "@bitwarden/common/services/import/import-api.service";
import { ImportService } from "@bitwarden/common/services/import/import.service";
import { KeyConnectorService } from "@bitwarden/common/services/keyConnector.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";
import { NoopMessagingService } from "@bitwarden/common/services/noopMessaging.service";
import { OrganizationUserServiceImplementation } from "@bitwarden/common/services/organization-user/organization-user.service.implementation";
import { OrganizationApiService } from "@bitwarden/common/services/organization/organization-api.service";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";
import { PasswordGenerationService } from "@bitwarden/common/services/passwordGeneration.service";
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
import { VaultTimeoutService } from "@bitwarden/common/services/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/services/vaultTimeout/vaultTimeoutSettings.service";
import { InternalFolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/services/cipher.service";
import { FolderApiService } from "@bitwarden/common/vault/services/folder/folder-api.service";
import { FolderService } from "@bitwarden/common/vault/services/folder/folder.service";
import { SyncNotifierService } from "@bitwarden/common/vault/services/sync/sync-notifier.service";
import { SyncService } from "@bitwarden/common/vault/services/sync/sync.service";
import { NodeCryptoFunctionService } from "@bitwarden/node/services/node-crypto-function.service";

import { Program } from "./program";
import { SendProgram } from "./send.program";
import { CliPlatformUtilsService } from "./services/cli-platform-utils.service";
import { ConsoleLogService } from "./services/console-log.service";
import { I18nService } from "./services/i18n.service";
import { LowdbStorageService } from "./services/lowdb-storage.service";
import { NodeApiService } from "./services/node-api.service";
import { NodeEnvSecureStorageService } from "./services/node-env-secure-storage.service";
import { VaultProgram } from "./vault.program";

// Polyfills
global.DOMParser = new jsdom.JSDOM().window.DOMParser;

// eslint-disable-next-line
const packageJson = require("../package.json");

export class Main {
  messagingService: NoopMessagingService;
  storageService: LowdbStorageService;
  secureStorageService: NodeEnvSecureStorageService;
  memoryStorageService: MemoryStorageService;
  i18nService: I18nService;
  platformUtilsService: CliPlatformUtilsService;
  cryptoService: CryptoService;
  tokenService: TokenService;
  appIdService: AppIdService;
  apiService: NodeApiService;
  environmentService: EnvironmentService;
  settingsService: SettingsService;
  cipherService: CipherService;
  folderService: InternalFolderService;
  organizationUserService: OrganizationUserService;
  collectionService: CollectionService;
  vaultTimeoutService: VaultTimeoutService;
  vaultTimeoutSettingsService: VaultTimeoutSettingsService;
  syncService: SyncService;
  passwordGenerationService: PasswordGenerationService;
  totpService: TotpService;
  containerService: ContainerService;
  auditService: AuditService;
  importService: ImportService;
  importApiService: ImportApiServiceAbstraction;
  exportService: ExportService;
  searchService: SearchService;
  cryptoFunctionService: NodeCryptoFunctionService;
  encryptService: EncryptServiceImplementation;
  authService: AuthService;
  policyService: PolicyService;
  program: Program;
  vaultProgram: VaultProgram;
  sendProgram: SendProgram;
  logService: ConsoleLogService;
  sendService: SendService;
  fileUploadService: FileUploadService;
  keyConnectorService: KeyConnectorService;
  userVerificationService: UserVerificationService;
  stateService: StateService;
  stateMigrationService: StateMigrationService;
  organizationService: OrganizationService;
  providerService: ProviderService;
  twoFactorService: TwoFactorService;
  broadcasterService: BroadcasterService;
  folderApiService: FolderApiService;
  userVerificationApiService: UserVerificationApiService;
  organizationApiService: OrganizationApiServiceAbstraction;
  syncNotifierService: SyncNotifierService;

  constructor() {
    let p = null;
    const relativeDataDir = path.join(path.dirname(process.execPath), "bw-data");
    if (fs.existsSync(relativeDataDir)) {
      p = relativeDataDir;
    } else if (process.env.BITWARDENCLI_APPDATA_DIR) {
      p = path.resolve(process.env.BITWARDENCLI_APPDATA_DIR);
    } else if (process.platform === "darwin") {
      p = path.join(process.env.HOME, "Library/Application Support/Bitwarden CLI");
    } else if (process.platform === "win32") {
      p = path.join(process.env.APPDATA, "Bitwarden CLI");
    } else if (process.env.XDG_CONFIG_HOME) {
      p = path.join(process.env.XDG_CONFIG_HOME, "Bitwarden CLI");
    } else {
      p = path.join(process.env.HOME, ".config/Bitwarden CLI");
    }

    this.i18nService = new I18nService("en", "./locales");
    this.platformUtilsService = new CliPlatformUtilsService(ClientType.Cli, packageJson);
    this.logService = new ConsoleLogService(
      this.platformUtilsService.isDev(),
      (level) => process.env.BITWARDENCLI_DEBUG !== "true" && level <= LogLevelType.Info
    );
    this.cryptoFunctionService = new NodeCryptoFunctionService();
    this.encryptService = new EncryptServiceImplementation(
      this.cryptoFunctionService,
      this.logService,
      true
    );
    this.storageService = new LowdbStorageService(this.logService, null, p, false, true);
    this.secureStorageService = new NodeEnvSecureStorageService(
      this.storageService,
      this.logService,
      () => this.cryptoService
    );

    this.memoryStorageService = new MemoryStorageService();

    this.stateMigrationService = new StateMigrationService(
      this.storageService,
      this.secureStorageService,
      new StateFactory(GlobalState, Account)
    );

    this.stateService = new StateService(
      this.storageService,
      this.secureStorageService,
      this.memoryStorageService,
      this.logService,
      this.stateMigrationService,
      new StateFactory(GlobalState, Account)
    );

    this.cryptoService = new CryptoService(
      this.cryptoFunctionService,
      this.encryptService,
      this.platformUtilsService,
      this.logService,
      this.stateService
    );

    this.appIdService = new AppIdService(this.storageService);
    this.tokenService = new TokenService(this.stateService);
    this.messagingService = new NoopMessagingService();
    this.environmentService = new EnvironmentService(this.stateService);

    const customUserAgent =
      "Bitwarden_CLI/" +
      this.platformUtilsService.getApplicationVersionSync() +
      " (" +
      this.platformUtilsService.getDeviceString().toUpperCase() +
      ")";
    this.apiService = new NodeApiService(
      this.tokenService,
      this.platformUtilsService,
      this.environmentService,
      this.appIdService,
      async (expired: boolean) => await this.logout(),
      customUserAgent
    );

    this.syncNotifierService = new SyncNotifierService();

    this.organizationApiService = new OrganizationApiService(this.apiService, this.syncService);

    this.containerService = new ContainerService(this.cryptoService, this.encryptService);

    this.settingsService = new SettingsService(this.stateService);

    this.fileUploadService = new FileUploadService(this.logService, this.apiService);

    this.cipherService = new CipherService(
      this.cryptoService,
      this.settingsService,
      this.apiService,
      this.fileUploadService,
      this.i18nService,
      null,
      this.logService,
      this.stateService,
      this.encryptService
    );

    this.broadcasterService = new BroadcasterService();

    this.folderService = new FolderService(
      this.cryptoService,
      this.i18nService,
      this.cipherService,
      this.stateService
    );

    this.folderApiService = new FolderApiService(this.folderService, this.apiService);

    this.collectionService = new CollectionService(
      this.cryptoService,
      this.i18nService,
      this.stateService
    );

    this.searchService = new SearchService(this.cipherService, this.logService, this.i18nService);

    this.providerService = new ProviderService(this.stateService);

    this.organizationService = new OrganizationService(this.stateService);

    this.organizationUserService = new OrganizationUserServiceImplementation(this.apiService);

    this.policyService = new PolicyService(this.stateService, this.organizationService);

    this.sendService = new SendService(
      this.cryptoService,
      this.apiService,
      this.fileUploadService,
      this.i18nService,
      this.cryptoFunctionService,
      this.stateService
    );

    this.keyConnectorService = new KeyConnectorService(
      this.stateService,
      this.cryptoService,
      this.apiService,
      this.tokenService,
      this.logService,
      this.organizationService,
      this.cryptoFunctionService,
      async (expired: boolean) => await this.logout()
    );

    this.twoFactorService = new TwoFactorService(this.i18nService, this.platformUtilsService);

    this.authService = new AuthService(
      this.cryptoService,
      this.apiService,
      this.tokenService,
      this.appIdService,
      this.platformUtilsService,
      this.messagingService,
      this.logService,
      this.keyConnectorService,
      this.environmentService,
      this.stateService,
      this.twoFactorService,
      this.i18nService
    );

    const lockedCallback = async () =>
      await this.cryptoService.clearStoredKey(KeySuffixOptions.Auto);

    this.vaultTimeoutSettingsService = new VaultTimeoutSettingsService(
      this.cryptoService,
      this.tokenService,
      this.policyService,
      this.stateService
    );

    this.vaultTimeoutService = new VaultTimeoutService(
      this.cipherService,
      this.folderService,
      this.collectionService,
      this.cryptoService,
      this.platformUtilsService,
      this.messagingService,
      this.searchService,
      this.keyConnectorService,
      this.stateService,
      this.authService,
      this.vaultTimeoutSettingsService,
      lockedCallback,
      null
    );

    this.syncService = new SyncService(
      this.apiService,
      this.settingsService,
      this.folderService,
      this.cipherService,
      this.cryptoService,
      this.collectionService,
      this.messagingService,
      this.policyService,
      this.sendService,
      this.logService,
      this.keyConnectorService,
      this.stateService,
      this.providerService,
      this.folderApiService,
      this.organizationService,
      async (expired: boolean) => await this.logout()
    );

    this.passwordGenerationService = new PasswordGenerationService(
      this.cryptoService,
      this.policyService,
      this.stateService
    );

    this.totpService = new TotpService(this.cryptoFunctionService, this.logService);

    this.importApiService = new ImportApiService(this.apiService);

    this.importService = new ImportService(
      this.cipherService,
      this.folderService,
      this.importApiService,
      this.i18nService,
      this.collectionService,
      this.cryptoService
    );
    this.exportService = new ExportService(
      this.folderService,
      this.cipherService,
      this.apiService,
      this.cryptoService,
      this.cryptoFunctionService
    );

    this.auditService = new AuditService(this.cryptoFunctionService, this.apiService);
    this.program = new Program(this);
    this.vaultProgram = new VaultProgram(this);
    this.sendProgram = new SendProgram(this);

    this.userVerificationApiService = new UserVerificationApiService(this.apiService);

    this.userVerificationService = new UserVerificationService(
      this.cryptoService,
      this.i18nService,
      this.userVerificationApiService
    );
  }

  async run() {
    await this.init();

    await this.program.register();
    await this.vaultProgram.register();
    await this.sendProgram.register();

    program.parse(process.argv);

    if (process.argv.slice(2).length === 0) {
      program.outputHelp();
    }
  }

  async logout() {
    this.authService.logOut(() => {
      /* Do nothing */
    });
    const userId = await this.stateService.getUserId();
    await Promise.all([
      this.syncService.setLastSync(new Date(0)),
      this.cryptoService.clearKeys(),
      this.settingsService.clear(userId),
      this.cipherService.clear(userId),
      this.folderService.clear(userId),
      this.collectionService.clear(userId),
      this.policyService.clear(userId),
      this.passwordGenerationService.clear(),
    ]);
    await this.stateService.clean();
    process.env.BW_SESSION = null;
  }

  private async init() {
    await this.storageService.init();
    await this.stateService.init();
    this.containerService.attachToGlobal(global);
    await this.environmentService.setUrlsFromStorage();
    const locale = await this.stateService.getLocale();
    await this.i18nService.init(locale);
    this.twoFactorService.init();

    const installedVersion = await this.stateService.getInstalledVersion();
    const currentVersion = await this.platformUtilsService.getApplicationVersion();
    if (installedVersion == null || installedVersion !== currentVersion) {
      await this.stateService.setInstalledVersion(currentVersion);
    }
  }
}

const main = new Main();
main.run();
