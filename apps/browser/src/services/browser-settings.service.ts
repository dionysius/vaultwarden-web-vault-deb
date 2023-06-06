import { BehaviorSubject } from "rxjs";

import { AccountSettingsSettings } from "@bitwarden/common/platform/models/domain/account";
import { SettingsService } from "@bitwarden/common/services/settings.service";

import { browserSession, sessionSync } from "../platform/decorators/session-sync-observable";

@browserSession
export class BrowserSettingsService extends SettingsService {
  @sessionSync({ initializer: (obj: string[][]) => obj })
  protected _settings: BehaviorSubject<AccountSettingsSettings>;

  @sessionSync({ initializer: (b: boolean) => b })
  protected _disableFavicon: BehaviorSubject<boolean>;
}
