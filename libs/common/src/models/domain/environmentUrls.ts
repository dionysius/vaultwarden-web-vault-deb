import { Jsonify } from "type-fest";

export class EnvironmentUrls {
  base: string = null;
  api: string = null;
  identity: string = null;
  icons: string = null;
  notifications: string = null;
  events: string = null;
  webVault: string = null;
  keyConnector: string = null;

  static fromJSON(obj: Jsonify<EnvironmentUrls>): EnvironmentUrls {
    return Object.assign(new EnvironmentUrls(), obj);
  }
}
