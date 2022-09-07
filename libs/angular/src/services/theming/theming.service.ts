import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, filter, fromEvent, Observable } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";
import { ThemeType } from "@bitwarden/common/enums/themeType";

import { WINDOW } from "../injection-tokens";

import { Theme } from "./theme";
import { ThemeBuilder } from "./themeBuilder";
import { AbstractThemingService } from "./theming.service.abstraction";

@Injectable()
export class ThemingService implements AbstractThemingService {
  private _theme = new BehaviorSubject<ThemeBuilder | null>(null);
  theme$: Observable<Theme> = this._theme.pipe(filter((x) => x !== null));

  constructor(
    private stateService: StateService,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.monitorThemeChanges();
  }

  async monitorThemeChanges(): Promise<void> {
    this._theme.next(
      new ThemeBuilder(await this.stateService.getTheme(), await this.getSystemTheme())
    );
    this.monitorConfiguredThemeChanges();
    this.monitorSystemThemeChanges();
  }

  updateSystemTheme(systemTheme: ThemeType): void {
    this._theme.next(this._theme.getValue().updateSystemTheme(systemTheme));
  }

  async updateConfiguredTheme(theme: ThemeType): Promise<void> {
    await this.stateService.setTheme(theme);
    this._theme.next(this._theme.getValue().updateConfiguredTheme(theme));
  }

  protected monitorConfiguredThemeChanges(): void {
    this.theme$.subscribe((theme: Theme) => {
      this.document.documentElement.classList.remove(
        "theme_" + ThemeType.Light,
        "theme_" + ThemeType.Dark,
        "theme_" + ThemeType.Nord,
        "theme_" + ThemeType.SolarizedDark
      );
      this.document.documentElement.classList.add("theme_" + theme.effectiveTheme);
    });
  }

  // We use a media match query for monitoring the system theme on web and browser, but this doesn't work for electron apps on Linux.
  // In desktop we override these methods to track systemTheme with the electron renderer instead, which works for all OSs.
  protected async getSystemTheme(): Promise<ThemeType> {
    return this.window.matchMedia("(prefers-color-scheme: dark)").matches
      ? ThemeType.Dark
      : ThemeType.Light;
  }

  protected monitorSystemThemeChanges(): void {
    fromEvent<MediaQueryListEvent>(
      this.window.matchMedia("(prefers-color-scheme: dark)"),
      "change"
    ).subscribe((event) => {
      this.updateSystemTheme(event.matches ? ThemeType.Dark : ThemeType.Light);
    });
  }
}
