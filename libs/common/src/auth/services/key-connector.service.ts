import { firstValueFrom } from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { OrganizationService } from "../../admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationUserType } from "../../admin-console/enums";
import { KeysRequest } from "../../models/request/keys.request";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { KeyGenerationService } from "../../platform/abstractions/key-generation.service";
import { LogService } from "../../platform/abstractions/log.service";
import { Utils } from "../../platform/misc/utils";
import { SymmetricCryptoKey } from "../../platform/models/domain/symmetric-crypto-key";
import {
  ActiveUserState,
  KEY_CONNECTOR_DISK,
  StateProvider,
  UserKeyDefinition,
} from "../../platform/state";
import { MasterKey } from "../../types/key";
import { AccountService } from "../abstractions/account.service";
import { KeyConnectorService as KeyConnectorServiceAbstraction } from "../abstractions/key-connector.service";
import { InternalMasterPasswordServiceAbstraction } from "../abstractions/master-password.service.abstraction";
import { TokenService } from "../abstractions/token.service";
import { KdfConfig } from "../models/domain/kdf-config";
import { KeyConnectorUserKeyRequest } from "../models/request/key-connector-user-key.request";
import { SetKeyConnectorKeyRequest } from "../models/request/set-key-connector-key.request";
import { IdentityTokenResponse } from "../models/response/identity-token.response";

export const USES_KEY_CONNECTOR = new UserKeyDefinition<boolean>(
  KEY_CONNECTOR_DISK,
  "usesKeyConnector",
  {
    deserializer: (usesKeyConnector) => usesKeyConnector,
    clearOn: ["logout"],
  },
);

export const CONVERT_ACCOUNT_TO_KEY_CONNECTOR = new UserKeyDefinition<boolean>(
  KEY_CONNECTOR_DISK,
  "convertAccountToKeyConnector",
  {
    deserializer: (convertAccountToKeyConnector) => convertAccountToKeyConnector,
    clearOn: ["logout"],
  },
);

export class KeyConnectorService implements KeyConnectorServiceAbstraction {
  private usesKeyConnectorState: ActiveUserState<boolean>;
  private convertAccountToKeyConnectorState: ActiveUserState<boolean>;
  constructor(
    private accountService: AccountService,
    private masterPasswordService: InternalMasterPasswordServiceAbstraction,
    private cryptoService: CryptoService,
    private apiService: ApiService,
    private tokenService: TokenService,
    private logService: LogService,
    private organizationService: OrganizationService,
    private keyGenerationService: KeyGenerationService,
    private logoutCallback: (expired: boolean, userId?: string) => Promise<void>,
    private stateProvider: StateProvider,
  ) {
    this.usesKeyConnectorState = this.stateProvider.getActive(USES_KEY_CONNECTOR);
    this.convertAccountToKeyConnectorState = this.stateProvider.getActive(
      CONVERT_ACCOUNT_TO_KEY_CONNECTOR,
    );
  }

  async setUsesKeyConnector(usesKeyConnector: boolean) {
    await this.usesKeyConnectorState.update(() => usesKeyConnector);
  }

  getUsesKeyConnector(): Promise<boolean> {
    return firstValueFrom(this.usesKeyConnectorState.state$);
  }

  async userNeedsMigration() {
    const loggedInUsingSso = await this.tokenService.getIsExternal();
    const requiredByOrganization = (await this.getManagingOrganization()) != null;
    const userIsNotUsingKeyConnector = !(await this.getUsesKeyConnector());

    return loggedInUsingSso && requiredByOrganization && userIsNotUsingKeyConnector;
  }

  async migrateUser() {
    const organization = await this.getManagingOrganization();
    const userId = (await firstValueFrom(this.accountService.activeAccount$))?.id;
    const masterKey = await firstValueFrom(this.masterPasswordService.masterKey$(userId));
    const keyConnectorRequest = new KeyConnectorUserKeyRequest(masterKey.encKeyB64);

    try {
      await this.apiService.postUserKeyToKeyConnector(
        organization.keyConnectorUrl,
        keyConnectorRequest,
      );
    } catch (e) {
      this.handleKeyConnectorError(e);
    }

    await this.apiService.postConvertToKeyConnector();
  }

  // TODO: UserKey should be renamed to MasterKey and typed accordingly
  async setMasterKeyFromUrl(url: string) {
    try {
      const masterKeyResponse = await this.apiService.getMasterKeyFromKeyConnector(url);
      const keyArr = Utils.fromB64ToArray(masterKeyResponse.key);
      const masterKey = new SymmetricCryptoKey(keyArr) as MasterKey;
      const userId = (await firstValueFrom(this.accountService.activeAccount$))?.id;
      await this.masterPasswordService.setMasterKey(masterKey, userId);
    } catch (e) {
      this.handleKeyConnectorError(e);
    }
  }

  async getManagingOrganization() {
    const orgs = await this.organizationService.getAll();
    return orgs.find(
      (o) =>
        o.keyConnectorEnabled &&
        o.type !== OrganizationUserType.Admin &&
        o.type !== OrganizationUserType.Owner &&
        !o.isProviderUser,
    );
  }

  async convertNewSsoUserToKeyConnector(tokenResponse: IdentityTokenResponse, orgId: string) {
    // TODO: Remove after tokenResponse.keyConnectorUrl is deprecated in 2023.10 release (https://bitwarden.atlassian.net/browse/PM-3537)
    const {
      kdf,
      kdfIterations,
      kdfMemory,
      kdfParallelism,
      keyConnectorUrl: legacyKeyConnectorUrl,
      userDecryptionOptions,
    } = tokenResponse;
    const password = await this.keyGenerationService.createKey(512);
    const kdfConfig = new KdfConfig(kdfIterations, kdfMemory, kdfParallelism);

    const masterKey = await this.cryptoService.makeMasterKey(
      password.keyB64,
      await this.tokenService.getEmail(),
      kdf,
      kdfConfig,
    );
    const keyConnectorRequest = new KeyConnectorUserKeyRequest(masterKey.encKeyB64);
    const userId = (await firstValueFrom(this.accountService.activeAccount$))?.id;
    await this.masterPasswordService.setMasterKey(masterKey, userId);

    const userKey = await this.cryptoService.makeUserKey(masterKey);
    await this.cryptoService.setUserKey(userKey[0]);
    await this.cryptoService.setMasterKeyEncryptedUserKey(userKey[1].encryptedString);

    const [pubKey, privKey] = await this.cryptoService.makeKeyPair();

    try {
      const keyConnectorUrl =
        legacyKeyConnectorUrl ?? userDecryptionOptions?.keyConnectorOption?.keyConnectorUrl;
      await this.apiService.postUserKeyToKeyConnector(keyConnectorUrl, keyConnectorRequest);
    } catch (e) {
      this.handleKeyConnectorError(e);
    }

    const keys = new KeysRequest(pubKey, privKey.encryptedString);
    const setPasswordRequest = new SetKeyConnectorKeyRequest(
      userKey[1].encryptedString,
      kdf,
      kdfConfig,
      orgId,
      keys,
    );
    await this.apiService.postSetKeyConnectorKey(setPasswordRequest);
  }

  async setConvertAccountRequired(status: boolean) {
    await this.convertAccountToKeyConnectorState.update(() => status);
  }

  getConvertAccountRequired(): Promise<boolean> {
    return firstValueFrom(this.convertAccountToKeyConnectorState.state$);
  }

  async removeConvertAccountRequired() {
    await this.setConvertAccountRequired(null);
  }

  private handleKeyConnectorError(e: any) {
    this.logService.error(e);
    if (this.logoutCallback != null) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.logoutCallback(false);
    }
    throw new Error("Key Connector error");
  }
}
