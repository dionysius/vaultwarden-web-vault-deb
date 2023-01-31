import { VaultTimeoutService as AbstractVaultTimeoutService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeout.service";

import VaultTimeoutService from "../../services/vaultTimeout/vaultTimeout.service";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";
import {
  folderServiceFactory,
  FolderServiceInitOptions,
} from "../../vault/background/service_factories/folder-service.factory";

import { authServiceFactory, AuthServiceInitOptions } from "./auth-service.factory";
import {
  collectionServiceFactory,
  CollectionServiceInitOptions,
} from "./collection-service.factory";
import { cryptoServiceFactory, CryptoServiceInitOptions } from "./crypto-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import {
  keyConnectorServiceFactory,
  KeyConnectorServiceInitOptions,
} from "./key-connector-service.factory";
import { messagingServiceFactory, MessagingServiceInitOptions } from "./messaging-service.factory";
import {
  platformUtilsServiceFactory,
  PlatformUtilsServiceInitOptions,
} from "./platform-utils-service.factory";
import { searchServiceFactory, SearchServiceInitOptions } from "./search-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";
import {
  vaultTimeoutSettingsServiceFactory,
  VaultTimeoutSettingsServiceInitOptions,
} from "./vault-timeout-settings-service.factory";

type VaultTimeoutServiceFactoryOptions = FactoryOptions & {
  vaultTimeoutServiceOptions: {
    lockedCallback: (userId?: string) => Promise<void>;
    loggedOutCallback: (expired: boolean, userId?: string) => Promise<void>;
  };
};

export type VaultTimeoutServiceInitOptions = VaultTimeoutServiceFactoryOptions &
  CipherServiceInitOptions &
  FolderServiceInitOptions &
  CollectionServiceInitOptions &
  CryptoServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  MessagingServiceInitOptions &
  SearchServiceInitOptions &
  KeyConnectorServiceInitOptions &
  StateServiceInitOptions &
  AuthServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions;

export function vaultTimeoutServiceFactory(
  cache: { vaultTimeoutService?: AbstractVaultTimeoutService } & CachedServices,
  opts: VaultTimeoutServiceInitOptions
): Promise<AbstractVaultTimeoutService> {
  return factory(
    cache,
    "vaultTimeoutService",
    opts,
    async () =>
      new VaultTimeoutService(
        await cipherServiceFactory(cache, opts),
        await folderServiceFactory(cache, opts),
        await collectionServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await messagingServiceFactory(cache, opts),
        await searchServiceFactory(cache, opts),
        await keyConnectorServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await authServiceFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        opts.vaultTimeoutServiceOptions.lockedCallback,
        opts.vaultTimeoutServiceOptions.loggedOutCallback
      )
  );
}
