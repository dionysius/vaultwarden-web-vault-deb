import { BehaviorSubject, concatMap } from "rxjs";

import { SettingsService as SettingsServiceAbstraction } from "../abstractions/settings.service";
import { StateService } from "../platform/abstractions/state.service";
import { Utils } from "../platform/misc/utils";
import { AccountSettingsSettings } from "../platform/models/domain/account";

export class SettingsService implements SettingsServiceAbstraction {
  protected _settings: BehaviorSubject<AccountSettingsSettings> = new BehaviorSubject({});
  protected _disableFavicon = new BehaviorSubject<boolean>(null);

  settings$ = this._settings.asObservable();
  disableFavicon$ = this._disableFavicon.asObservable();

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
          const disableFavicon = await this.stateService.getDisableFavicon();

          this._settings.next(data);
          this._disableFavicon.next(disableFavicon);
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

  getEquivalentDomains(url: string): Set<string> {
    const domain = Utils.getDomain(url);
    if (domain == null) {
      return new Set();
    }

    const settings = this._settings.getValue();

    let result: string[] = [];

    if (settings?.equivalentDomains != null) {
      settings.equivalentDomains
        .filter((ed) => ed.length > 0 && ed.includes(domain))
        .forEach((ed) => {
          result = result.concat(ed);
        });
    }

    return new Set(result);
  }

  async setDisableFavicon(value: boolean) {
    this._disableFavicon.next(value);
    await this.stateService.setDisableFavicon(value);
  }

  getDisableFavicon(): boolean {
    return this._disableFavicon.getValue();
  }

  async setAutoFillOverlayVisibility(value: number): Promise<void> {
    return await this.stateService.setAutoFillOverlayVisibility(value);
  }

  async getAutoFillOverlayVisibility(): Promise<number> {
    return await this.stateService.getAutoFillOverlayVisibility();
  }

  async clear(userId?: string): Promise<void> {
    if (userId == null || userId == (await this.stateService.getUserId())) {
      this._settings.next({});
    }

    await this.stateService.setSettings(null, { userId: userId });
  }
}
