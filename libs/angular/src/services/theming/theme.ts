import { ThemeType } from "@bitwarden/common/enums";

export interface Theme {
  configuredTheme: ThemeType;
  effectiveTheme: ThemeType;
}
