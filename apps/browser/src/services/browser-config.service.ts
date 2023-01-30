import { BehaviorSubject } from "rxjs";

import { ServerConfig } from "@bitwarden/common/abstractions/config/server-config";
import { ConfigService } from "@bitwarden/common/services/config/config.service";

import { browserSession, sessionSync } from "../decorators/session-sync-observable";

@browserSession
export class BrowserConfigService extends ConfigService {
  @sessionSync<ServerConfig>({ initializer: ServerConfig.fromJSON })
  protected _serverConfig: BehaviorSubject<ServerConfig | null>;
}
