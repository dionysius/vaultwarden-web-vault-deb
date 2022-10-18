import { Jsonify } from "type-fest";

import {
  ServerConfigResponse,
  ThirdPartyServerConfigResponse,
  EnvironmentServerConfigResponse,
} from "../response/server-config.response";

export class ServerConfigData {
  version: string;
  gitHash: string;
  server?: ThirdPartyServerConfigData;
  environment?: EnvironmentServerConfigData;
  utcDate: string;

  constructor(serverConfigResponse: Partial<ServerConfigResponse>) {
    this.version = serverConfigResponse?.version;
    this.gitHash = serverConfigResponse?.gitHash;
    this.server = serverConfigResponse?.server
      ? new ThirdPartyServerConfigData(serverConfigResponse.server)
      : null;
    this.utcDate = new Date().toISOString();
    this.environment = serverConfigResponse?.environment
      ? new EnvironmentServerConfigData(serverConfigResponse.environment)
      : null;
  }

  static fromJSON(obj: Jsonify<ServerConfigData>): ServerConfigData {
    return Object.assign(new ServerConfigData({}), obj, {
      server: obj?.server ? ThirdPartyServerConfigData.fromJSON(obj.server) : null,
      environment: obj?.environment ? EnvironmentServerConfigData.fromJSON(obj.environment) : null,
    });
  }
}

export class ThirdPartyServerConfigData {
  name: string;
  url: string;

  constructor(response: Partial<ThirdPartyServerConfigResponse>) {
    this.name = response.name;
    this.url = response.url;
  }

  static fromJSON(obj: Jsonify<ThirdPartyServerConfigData>): ThirdPartyServerConfigData {
    return Object.assign(new ThirdPartyServerConfigData({}), obj);
  }
}

export class EnvironmentServerConfigData {
  vault: string;
  api: string;
  identity: string;
  notifications: string;
  sso: string;

  constructor(response: Partial<EnvironmentServerConfigResponse>) {
    this.vault = response.vault;
    this.api = response.api;
    this.identity = response.identity;
    this.notifications = response.notifications;
    this.sso = response.sso;
  }

  static fromJSON(obj: Jsonify<EnvironmentServerConfigData>): EnvironmentServerConfigData {
    return Object.assign(new EnvironmentServerConfigData({}), obj);
  }
}
