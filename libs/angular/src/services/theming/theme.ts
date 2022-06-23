import { ThemeType } from "@bitwarden/common/enums/themeType";

export interface Theme {
  configuredTheme: ThemeType;
  effectiveTheme: ThemeType;
}
