import { ThemeType } from "@bitwarden/common/platform/enums";

export interface Theme {
  configuredTheme: ThemeType;
  effectiveTheme: ThemeType;
}
