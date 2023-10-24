import { Injectable, NgZone } from "@angular/core";
import { OidcClient } from "oidc-client-ts";
import { Subject, firstValueFrom } from "rxjs";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { DialogService } from "../../../../components/src/dialog";
import { ClientInfo, Vault } from "../../importers/lastpass/access";
import { FederatedUserContext } from "../../importers/lastpass/access/models";

import { LastPassAwaitSSODialogComponent } from "./dialog/lastpass-await-sso-dialog.component";
import { LastPassPasswordPromptComponent } from "./dialog/lastpass-password-prompt.component";
import { LastPassDirectImportUIService } from "./lastpass-direct-import-ui.service";

@Injectable({
  providedIn: "root",
})
export class LastPassDirectImportService {
  private vault: Vault;

  private oidcClient: OidcClient;

  private _ssoImportCallback$ = new Subject<{ oidcCode: string; oidcState: string }>();
  ssoImportCallback$ = this._ssoImportCallback$.asObservable();

  constructor(
    private tokenService: TokenService,
    private cryptoFunctionService: CryptoFunctionService,
    private appIdService: AppIdService,
    private lastPassDirectImportUIService: LastPassDirectImportUIService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private dialogService: DialogService,
    private platformUtilsService: PlatformUtilsService
  ) {
    this.vault = new Vault(this.cryptoFunctionService, this.tokenService);

    /** TODO: remove this in favor of dedicated service */
    this.broadcasterService.subscribe("LastPassDirectImportService", (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "importCallbackLastPass":
            this._ssoImportCallback$.next({ oidcCode: message.code, oidcState: message.state });
            break;
          default:
            break;
        }
      });
    });
  }

  /**
   * Import a LastPass account by email
   * @param email
   * @param includeSharedFolders
   * @returns The CSV export data of the account
   */
  async handleImport(email: string, includeSharedFolders: boolean): Promise<string> {
    await this.verifyLastPassAccountExists(email);

    if (this.isAccountFederated) {
      const oidc = await this.handleFederatedLogin(email);
      const csvData = await this.handleFederatedImport(
        oidc.oidcCode,
        oidc.oidcState,
        includeSharedFolders
      );
      return csvData;
    }
    const password = await LastPassPasswordPromptComponent.open(this.dialogService);
    const csvData = await this.handleStandardImport(email, password, includeSharedFolders);

    return csvData;
  }

  private get isAccountFederated(): boolean {
    return this.vault.userType.isFederated();
  }

  private async verifyLastPassAccountExists(email: string) {
    await this.vault.setUserTypeContext(email);
  }

  private async handleFederatedLogin(email: string) {
    const ssoCallbackPromise = firstValueFrom(this.ssoImportCallback$);
    const request = await this.createOidcSigninRequest(email);
    this.platformUtilsService.launchUri(request.url);

    const cancelDialogRef = LastPassAwaitSSODialogComponent.open(this.dialogService);
    const cancelled = firstValueFrom(cancelDialogRef.closed).then((_didCancel) => {
      throw Error("SSO auth cancelled");
    });

    return Promise.race<{
      oidcCode: string;
      oidcState: string;
    }>([cancelled, ssoCallbackPromise]).finally(() => {
      cancelDialogRef.close();
    });
  }

  private async createOidcSigninRequest(email: string) {
    this.oidcClient = new OidcClient({
      authority: this.vault.userType.openIDConnectAuthorityBase,
      client_id: this.vault.userType.openIDConnectClientId,
      // TODO: this is different per client
      redirect_uri: "bitwarden://import-callback-lp",
      response_type: "code",
      scope: this.vault.userType.oidcScope,
      response_mode: "query",
      loadUserInfo: true,
    });

    return await this.oidcClient.createSigninRequest({
      state: {
        email,
      },
      nonce: await this.passwordGenerationService.generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        number: true,
      }),
    });
  }

  private async handleStandardImport(
    email: string,
    password: string,
    includeSharedFolders: boolean
  ): Promise<string> {
    const clientInfo = await this.createClientInfo(email);
    await this.vault.open(email, password, clientInfo, this.lastPassDirectImportUIService, {
      parseSecureNotesToAccount: false,
    });

    return this.vault.accountsToExportedCsvString(!includeSharedFolders);
  }

  private async handleFederatedImport(
    oidcCode: string,
    oidcState: string,
    includeSharedFolders: boolean
  ): Promise<string> {
    const response = await this.oidcClient.processSigninResponse(
      this.oidcClient.settings.redirect_uri + "/?code=" + oidcCode + "&state=" + oidcState
    );
    const userState = response.userState as any;

    const federatedUser = new FederatedUserContext();
    federatedUser.idToken = response.id_token;
    federatedUser.accessToken = response.access_token;
    federatedUser.idpUserInfo = response.profile;
    federatedUser.username = userState.email;

    const clientInfo = await this.createClientInfo(federatedUser.username);
    await this.vault.openFederated(federatedUser, clientInfo, this.lastPassDirectImportUIService, {
      parseSecureNotesToAccount: false,
    });

    return this.vault.accountsToExportedCsvString(!includeSharedFolders);
  }

  private async createClientInfo(email: string): Promise<ClientInfo> {
    const appId = await this.appIdService.getAppId();
    const id = "lastpass" + appId + email;
    const idHash = await this.cryptoFunctionService.hash(id, "sha256");
    return ClientInfo.createClientInfo(Utils.fromBufferToHex(idHash));
  }
}
