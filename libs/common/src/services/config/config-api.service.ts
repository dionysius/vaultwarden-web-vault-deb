import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ConfigApiServiceAbstraction as ConfigApiServiceAbstraction } from "@bitwarden/common/abstractions/config/config-api.service.abstraction";
import { ServerConfigResponse } from "@bitwarden/common/models/response/server-config-response";

export class ConfigApiService implements ConfigApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  async get(): Promise<ServerConfigResponse> {
    const r = await this.apiService.send("GET", "/config", null, true, true);
    return new ServerConfigResponse(r);
  }
}
