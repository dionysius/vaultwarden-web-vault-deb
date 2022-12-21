import { Icon } from "@bitwarden/components";

import { WebI18nKey } from "../../../core/web-i18n.service.implementation";

import { ReportVariant } from "./report-variant";

export type ReportEntry = {
  title: WebI18nKey;
  description: WebI18nKey;
  route: string;
  icon: Icon;
  variant: ReportVariant;
};
