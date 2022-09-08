import { ServerConfigResponse } from "@bitwarden/common/models/response/server-config-response";

export abstract class ConfigApiServiceAbstraction {
  get: () => Promise<ServerConfigResponse>;
}
