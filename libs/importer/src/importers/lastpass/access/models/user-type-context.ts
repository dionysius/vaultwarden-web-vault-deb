import { IdpProvider, LastpassLoginType } from "../enums";

export class UserTypeContext {
  type: LastpassLoginType;
  IdentityProviderGUID: string;
  IdentityProviderURL: string;
  OpenIDConnectAuthority: string;
  OpenIDConnectClientId: string;
  CompanyId: number;
  Provider: IdpProvider;
  PkceEnabled: boolean;
  IsPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === LastpassLoginType.Federated &&
      this.hasValue(this.IdentityProviderURL) &&
      this.hasValue(this.OpenIDConnectAuthority) &&
      this.hasValue(this.OpenIDConnectClientId)
    );
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}
