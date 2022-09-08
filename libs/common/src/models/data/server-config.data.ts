import {
  ServerConfigResponse,
  ThirdPartyServerConfigResponse,
  EnvironmentServerConfigResponse,
} from "../response/server-config-response";

export class ServerConfigData {
  version: string;
  gitHash: string;
  server?: ThirdPartyServerConfigData;
  environment?: EnvironmentServerConfigData;
  utcDate: string;

  constructor(serverConfigReponse: ServerConfigResponse) {
    this.version = serverConfigReponse?.version;
    this.gitHash = serverConfigReponse?.gitHash;
    this.server = serverConfigReponse?.server
      ? new ThirdPartyServerConfigData(serverConfigReponse.server)
      : null;
    this.utcDate = new Date().toISOString();
    this.environment = serverConfigReponse?.environment
      ? new EnvironmentServerConfigData(serverConfigReponse.environment)
      : null;
  }
}

export class ThirdPartyServerConfigData {
  name: string;
  url: string;

  constructor(response: ThirdPartyServerConfigResponse) {
    this.name = response.name;
    this.url = response.url;
  }
}

export class EnvironmentServerConfigData {
  vault: string;
  api: string;
  identity: string;
  admin: string;
  notifications: string;
  sso: string;

  constructor(response: EnvironmentServerConfigResponse) {
    this.vault = response.vault;
    this.api = response.api;
    this.identity = response.identity;
    this.admin = response.admin;
    this.notifications = response.notifications;
    this.sso = response.sso;
  }
}
