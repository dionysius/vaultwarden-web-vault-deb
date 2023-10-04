import { HttpStatusCode } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { Account } from "./account";
import { Client } from "./client";
import { ClientInfo } from "./client-info";
import { CryptoUtils } from "./crypto-utils";
import { Parser } from "./parser";
import { ParserOptions } from "./parser-options";
import { RestClient } from "./rest-client";
import { Ui } from "./ui";
import { UserType } from "./user-type";

export class Vault {
  accounts: Account[];

  private client: Client;
  private cryptoUtils: CryptoUtils;

  constructor(private cryptoFunctionService: CryptoFunctionService) {
    this.cryptoUtils = new CryptoUtils(cryptoFunctionService);
    const parser = new Parser(cryptoFunctionService, this.cryptoUtils);
    this.client = new Client(parser, this.cryptoUtils);
  }

  async open(
    username: string,
    password: string,
    clientInfo: ClientInfo,
    ui: Ui,
    parserOptions: ParserOptions = ParserOptions.default
  ): Promise<void> {
    this.accounts = await this.client.openVault(username, password, clientInfo, ui, parserOptions);
  }

  async openFederated(
    username: string,
    k1: string,
    k2: string,
    clientInfo: ClientInfo,
    ui: Ui,
    parserOptions: ParserOptions = ParserOptions.default
  ): Promise<void> {
    const k1Arr = Utils.fromByteStringToArray(k1);
    const k2Arr = Utils.fromB64ToArray(k2);
    const hiddenPasswordArr = await this.cryptoFunctionService.hash(
      this.cryptoUtils.ExclusiveOr(k1Arr, k2Arr),
      "sha256"
    );
    const hiddenPassword = Utils.fromBufferToB64(hiddenPasswordArr);
    await this.open(username, hiddenPassword, clientInfo, ui, parserOptions);
  }

  async getUserType(username: string): Promise<UserType> {
    const lowercaseUsername = username.toLowerCase();
    const rest = new RestClient();
    rest.baseUrl = "https://lastpass.com";
    const endpoint = "lmiapi/login/type?username=" + encodeURIComponent(lowercaseUsername);
    const response = await rest.get(endpoint);
    if (response.status === HttpStatusCode.Ok) {
      const json = await response.json();
      const userType = new UserType();
      userType.CompanyId = json.CompanyId;
      userType.IdentityProviderGUID = json.IdentityProviderGUID;
      userType.IdentityProviderURL = json.IdentityProviderURL;
      userType.IsPasswordlessEnabled = json.IsPasswordlessEnabled;
      userType.OpenIDConnectAuthority = json.OpenIDConnectAuthority;
      userType.OpenIDConnectClientId = json.OpenIDConnectClientId;
      userType.PkceEnabled = json.PkceEnabled;
      userType.Provider = json.Provider;
      userType.type = json.type;
      return userType;
    }
    throw "Cannot determine LastPass user type.";
  }

  async getIdentityProviderKey(userType: UserType, idToken: string): Promise<string> {
    if (!userType.isFederated()) {
      throw "Cannot get identity provider key for a LastPass user that is not federated.";
    }
    const rest = new RestClient();
    rest.baseUrl = userType.IdentityProviderURL;
    const response = await rest.postJson("federatedlogin/api/v1/getkey", {
      company_id: userType.CompanyId,
      id_token: idToken,
    });
    if (response.status === HttpStatusCode.Ok) {
      const json = await response.json();
      return json["k2"] as string;
    }
    throw "Cannot get identity provider key from LastPass.";
  }
}
