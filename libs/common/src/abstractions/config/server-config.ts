import {
  ServerConfigData,
  ThirdPartyServerConfigData,
  EnvironmentServerConfigData,
} from "../../models/data/server-config.data";

const dayInMilliseconds = 24 * 3600 * 1000;
const eighteenHoursInMilliseconds = 18 * 3600 * 1000;

export class ServerConfig {
  version: string;
  gitHash: string;
  server?: ThirdPartyServerConfigData;
  environment?: EnvironmentServerConfigData;
  utcDate: Date;

  constructor(serverConfigData: ServerConfigData) {
    this.version = serverConfigData.version;
    this.gitHash = serverConfigData.gitHash;
    this.server = serverConfigData.server;
    this.utcDate = new Date(serverConfigData.utcDate);
    this.environment = serverConfigData.environment;

    if (this.server?.name == null && this.server?.url == null) {
      this.server = null;
    }
  }

  private getAgeInMilliseconds(): number {
    return new Date().getTime() - this.utcDate?.getTime();
  }

  isValid(): boolean {
    return this.getAgeInMilliseconds() <= dayInMilliseconds;
  }

  expiresSoon(): boolean {
    return this.getAgeInMilliseconds() >= eighteenHoursInMilliseconds;
  }
}
