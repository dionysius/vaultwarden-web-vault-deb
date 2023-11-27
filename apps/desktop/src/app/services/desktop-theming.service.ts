import { Injectable } from "@angular/core";

import { ThemingService } from "@bitwarden/angular/platform/services/theming/theming.service";
import { ThemeType } from "@bitwarden/common/platform/enums";

@Injectable()
export class DesktopThemingService extends ThemingService {
  protected async getSystemTheme(): Promise<ThemeType> {
    return await ipc.platform.getSystemTheme();
  }

  protected monitorSystemThemeChanges(): void {
    ipc.platform.onSystemThemeUpdated((theme: ThemeType) => this.updateSystemTheme(theme));
  }
}
