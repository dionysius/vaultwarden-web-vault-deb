import { BehaviorSubject, concatMap } from "rxjs";

import { SettingsService as SettingsServiceAbstraction } from "../abstractions/settings.service";
import { StateService } from "../abstractions/state.service";
import { Utils } from "../misc/utils";
import { AccountSettingsSettings } from "../models/domain/account";

export class SettingsService implements SettingsServiceAbstraction {
  private _settings: BehaviorSubject<AccountSettingsSettings> = new BehaviorSubject({});

  settings$ = this._settings.asObservable();

  constructor(private stateService: StateService) {
    this.stateService.activeAccountUnlocked$
      .pipe(
        concatMap(async (unlocked) => {
          if (Utils.global.bitwardenContainerService == null) {
            return;
          }

          if (!unlocked) {
            this._settings.next({});
            return;
          }

          const data = await this.stateService.getSettings();

          this._settings.next(data);
        })
      )
      .subscribe();
  }

  async setEquivalentDomains(equivalentDomains: string[][]): Promise<void> {
    const settings = this._settings.getValue() ?? {};

    settings.equivalentDomains = equivalentDomains;

    this._settings.next(settings);
    await this.stateService.setSettings(settings);
  }

  async clear(userId?: string): Promise<void> {
    if (userId == null || userId == (await this.stateService.getUserId())) {
      this._settings.next({});
    }

    await this.stateService.setSettings(null, { userId: userId });
  }
}
