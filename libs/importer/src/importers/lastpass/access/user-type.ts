export class UserType {
  /*
    Type values
    0 = Master Password
    3 = Federated
    */
  type: number;
  IdentityProviderGUID: string;
  IdentityProviderURL: string;
  OpenIDConnectAuthority: string;
  OpenIDConnectClientId: string;
  CompanyId: number;
  /*
    Provider Values
    0 = LastPass
    2 = Okta
    */
  Provider: number;
  PkceEnabled: boolean;
  IsPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === 3 &&
      this.hasValue(this.IdentityProviderURL) &&
      this.hasValue(this.OpenIDConnectAuthority) &&
      this.hasValue(this.OpenIDConnectClientId)
    );
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}
