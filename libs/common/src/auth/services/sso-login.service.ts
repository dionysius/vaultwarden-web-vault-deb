import { firstValueFrom } from "rxjs";

import {
  ActiveUserState,
  GlobalState,
  KeyDefinition,
  SSO_DISK,
  StateProvider,
} from "../../platform/state";

/**
 * Uses disk storage so that the code verifier can be persisted across sso redirects.
 */
const CODE_VERIFIER = new KeyDefinition<string>(SSO_DISK, "ssoCodeVerifier", {
  deserializer: (codeVerifier) => codeVerifier,
});

/**
 * Uses disk storage so that the sso state can be persisted across sso redirects.
 */
const SSO_STATE = new KeyDefinition<string>(SSO_DISK, "ssoState", {
  deserializer: (state) => state,
});

/**
 * Uses disk storage so that the organization sso identifier can be persisted across sso redirects.
 */
const ORGANIZATION_SSO_IDENTIFIER = new KeyDefinition<string>(
  SSO_DISK,
  "organizationSsoIdentifier",
  {
    deserializer: (organizationIdentifier) => organizationIdentifier,
  },
);

export class SsoLoginService {
  private codeVerifierState: GlobalState<string>;
  private ssoState: GlobalState<string>;
  private orgSsoIdentifierState: GlobalState<string>;
  private activeUserOrgSsoIdentifierState: ActiveUserState<string>;

  constructor(private stateProvider: StateProvider) {
    this.codeVerifierState = this.stateProvider.getGlobal(CODE_VERIFIER);
    this.ssoState = this.stateProvider.getGlobal(SSO_STATE);
    this.orgSsoIdentifierState = this.stateProvider.getGlobal(ORGANIZATION_SSO_IDENTIFIER);
    this.activeUserOrgSsoIdentifierState = this.stateProvider.getActive(
      ORGANIZATION_SSO_IDENTIFIER,
    );
  }

  getCodeVerifier(): Promise<string> {
    return firstValueFrom(this.codeVerifierState.state$);
  }

  async setCodeVerifier(codeVerifier: string): Promise<void> {
    await this.codeVerifierState.update((_) => codeVerifier);
  }

  getSsoState(): Promise<string> {
    return firstValueFrom(this.ssoState.state$);
  }

  async setSsoState(ssoState: string): Promise<void> {
    await this.ssoState.update((_) => ssoState);
  }

  getOrganizationSsoIdentifier(): Promise<string> {
    return firstValueFrom(this.orgSsoIdentifierState.state$);
  }

  async setOrganizationSsoIdentifier(organizationIdentifier: string): Promise<void> {
    await this.orgSsoIdentifierState.update((_) => organizationIdentifier);
  }

  getActiveUserOrganizationSsoIdentifier(): Promise<string> {
    return firstValueFrom(this.activeUserOrgSsoIdentifierState.state$);
  }

  async setActiveUserOrganizationSsoIdentifier(organizationIdentifier: string): Promise<void> {
    await this.activeUserOrgSsoIdentifierState.update((_) => organizationIdentifier);
  }
}
