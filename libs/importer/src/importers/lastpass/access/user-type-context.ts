export class UserTypeContext {
  type: Type;
  IdentityProviderGUID: string;
  IdentityProviderURL: string;
  OpenIDConnectAuthority: string;
  OpenIDConnectClientId: string;
  CompanyId: number;
  Provider: Provider;
  PkceEnabled: boolean;
  IsPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === Type.Federated &&
      this.hasValue(this.IdentityProviderURL) &&
      this.hasValue(this.OpenIDConnectAuthority) &&
      this.hasValue(this.OpenIDConnectClientId)
    );
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}

export enum Provider {
  Azure = 0,
  OktaAuthServer = 1,
  OktaNoAuthServer = 2,
  Google = 3,
  PingOne = 4,
  OneLogin = 5,
}

export enum Type {
  MasterPassword = 0,
  // Not sure what Types 1 and 2 are?
  Federated = 3,
}
