import { Inject, Injectable } from "@angular/core";

import {
  MEMORY_STORAGE,
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
} from "@bitwarden/angular/services/injection-tokens";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { StateMigrationService } from "@bitwarden/common/abstractions/stateMigration.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
} from "@bitwarden/common/abstractions/storage.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { CollectionData } from "@bitwarden/common/models/data/collection.data";
import { SendData } from "@bitwarden/common/models/data/send.data";
import { StorageOptions } from "@bitwarden/common/models/domain/storage-options";
import { StateService as BaseStateService } from "@bitwarden/common/services/state.service";
import { CipherData } from "@bitwarden/common/vault/models/data/cipher.data";
import { FolderData } from "@bitwarden/common/vault/models/data/folder.data";

import { Account } from "./account";
import { GlobalState } from "./global-state";

@Injectable()
export class StateService extends BaseStateService<GlobalState, Account> {
  constructor(
    storageService: AbstractStorageService,
    @Inject(SECURE_STORAGE) secureStorageService: AbstractStorageService,
    @Inject(MEMORY_STORAGE) memoryStorageService: AbstractMemoryStorageService,
    logService: LogService,
    stateMigrationService: StateMigrationService,
    @Inject(STATE_FACTORY) stateFactory: StateFactory<GlobalState, Account>,
    @Inject(STATE_SERVICE_USE_CACHE) useAccountCache = true
  ) {
    super(
      storageService,
      secureStorageService,
      memoryStorageService,
      logService,
      stateMigrationService,
      stateFactory,
      useAccountCache
    );
  }

  async addAccount(account: Account) {
    // Apply web overrides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }

  async getEncryptedCiphers(options?: StorageOptions): Promise<{ [id: string]: CipherData }> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.getEncryptedCiphers(options);
  }

  async setEncryptedCiphers(
    value: { [id: string]: CipherData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.setEncryptedCiphers(value, options);
  }

  async getEncryptedCollections(
    options?: StorageOptions
  ): Promise<{ [id: string]: CollectionData }> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.getEncryptedCollections(options);
  }

  async setEncryptedCollections(
    value: { [id: string]: CollectionData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.setEncryptedCollections(value, options);
  }

  async getEncryptedFolders(options?: StorageOptions): Promise<{ [id: string]: FolderData }> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.getEncryptedFolders(options);
  }

  async setEncryptedFolders(
    value: { [id: string]: FolderData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.setEncryptedFolders(value, options);
  }

  async getEncryptedSends(options?: StorageOptions): Promise<{ [id: string]: SendData }> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.getEncryptedSends(options);
  }

  async setEncryptedSends(
    value: { [id: string]: SendData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.setEncryptedSends(value, options);
  }

  override async getLastSync(options?: StorageOptions): Promise<string> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.getLastSync(options);
  }

  override async setLastSync(value: string, options?: StorageOptions): Promise<void> {
    options = this.reconcileOptions(options, await this.defaultInMemoryOptions());
    return await super.setLastSync(value, options);
  }
}
