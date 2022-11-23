import { Jsonify } from "type-fest";

import { StateService as BaseStateServiceAbstraction } from "@bitwarden/common/abstractions/state.service";
import { StorageOptions } from "@bitwarden/common/models/domain/storage-options";

import { Account } from "../../models/account";
import { BrowserComponentState } from "../../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../../models/browserGroupingsComponentState";
import { BrowserSendComponentState } from "../../models/browserSendComponentState";

export abstract class BrowserStateService extends BaseStateServiceAbstraction<Account> {
  abstract hasInSessionMemory(key: string): Promise<boolean>;
  abstract getFromSessionMemory<T>(key: string, deserializer?: (obj: Jsonify<T>) => T): Promise<T>;
  abstract setInSessionMemory(key: string, value: any): Promise<void>;
  getBrowserGroupingComponentState: (
    options?: StorageOptions
  ) => Promise<BrowserGroupingsComponentState>;
  setBrowserGroupingComponentState: (
    value: BrowserGroupingsComponentState,
    options?: StorageOptions
  ) => Promise<void>;
  getBrowserVaultItemsComponentState: (options?: StorageOptions) => Promise<BrowserComponentState>;
  setBrowserVaultItemsComponentState: (
    value: BrowserComponentState,
    options?: StorageOptions
  ) => Promise<void>;
  getBrowserSendComponentState: (options?: StorageOptions) => Promise<BrowserSendComponentState>;
  setBrowserSendComponentState: (
    value: BrowserSendComponentState,
    options?: StorageOptions
  ) => Promise<void>;
  getBrowserSendTypeComponentState: (options?: StorageOptions) => Promise<BrowserComponentState>;
  setBrowserSendTypeComponentState: (
    value: BrowserComponentState,
    options?: StorageOptions
  ) => Promise<void>;
}
