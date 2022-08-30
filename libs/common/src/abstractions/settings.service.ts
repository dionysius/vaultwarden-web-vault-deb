import { Observable } from "rxjs";

import { AccountSettingsSettings } from "../models/domain/account";

export abstract class SettingsService {
  settings$: Observable<AccountSettingsSettings>;

  setEquivalentDomains: (equivalentDomains: string[][]) => Promise<any>;
  clear: (userId?: string) => Promise<void>;
}
