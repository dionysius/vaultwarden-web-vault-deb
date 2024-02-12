import { Observable } from "rxjs";

import { AccountSettingsSettings } from "../platform/models/domain/account";

export abstract class SettingsService {
  settings$: Observable<AccountSettingsSettings>;
  disableFavicon$: Observable<boolean>;

  setEquivalentDomains: (equivalentDomains: string[][]) => Promise<any>;
  getEquivalentDomains: (url: string) => Set<string>;
  setDisableFavicon: (value: boolean) => Promise<any>;
  getDisableFavicon: () => boolean;
  clear: (userId?: string) => Promise<void>;
}
