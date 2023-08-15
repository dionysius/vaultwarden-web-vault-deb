import { Region } from "@bitwarden/common/platform/abstractions/environment.service";
import { VaultTimeoutAction } from "@bitwarden/common/src/enums/vault-timeout-action.enum";

export type UserSettings = {
  avatarColor: string | null;
  environmentUrls: {
    api: string | null;
    base: string | null;
    events: string | null;
    icons: string | null;
    identity: string | null;
    keyConnector: string | null;
    notifications: string | null;
    webVault: string | null;
  };
  pinProtected: { [key: string]: any };
  region: Region;
  serverConfig: {
    environment: {
      api: string | null;
      cloudRegion: string | null;
      identity: string | null;
      notifications: string | null;
      sso: string | null;
      vault: string | null;
    };
    featureStates: { [key: string]: any };
    gitHash: string;
    server: { [key: string]: any };
    utcDate: string;
    version: string;
  };
  settings: {
    equivalentDomains: string[][];
  };
  neverDomains?: { [key: string]: any };
  disableAddLoginNotification?: boolean;
  disableChangedPasswordNotification?: boolean;
  vaultTimeout: number;
  vaultTimeoutAction: VaultTimeoutAction;
};
