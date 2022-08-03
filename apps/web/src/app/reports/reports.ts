import { ReportEntry } from "./models/report-entry";

export enum ReportType {
  ExposedPasswords = "exposedPasswords",
  ReusedPasswords = "reusedPasswords",
  WeakPasswords = "weakPasswords",
  UnsecuredWebsites = "unsecuredWebsites",
  Inactive2fa = "inactive2fa",
  DataBreach = "dataBreach",
}

type ReportWithoutVariant = Omit<ReportEntry, "variant">;

export const reports: Record<ReportType, ReportWithoutVariant> = {
  [ReportType.ExposedPasswords]: {
    title: "exposedPasswordsReport",
    description: "exposedPasswordsReportDesc",
    route: "exposed-passwords-report",
    icon: "reportExposedPasswords",
  },
  [ReportType.ReusedPasswords]: {
    title: "reusedPasswordsReport",
    description: "reusedPasswordsReportDesc",
    route: "reused-passwords-report",
    icon: "reportReusedPasswords",
  },
  [ReportType.WeakPasswords]: {
    title: "weakPasswordsReport",
    description: "weakPasswordsReportDesc",
    route: "weak-passwords-report",
    icon: "reportWeakPasswords",
  },
  [ReportType.UnsecuredWebsites]: {
    title: "unsecuredWebsitesReport",
    description: "unsecuredWebsitesReportDesc",
    route: "unsecured-websites-report",
    icon: "reportUnsecuredWebsites",
  },
  [ReportType.Inactive2fa]: {
    title: "inactive2faReport",
    description: "inactive2faReportDesc",
    route: "inactive-two-factor-report",
    icon: "reportInactiveTwoFactor",
  },
  [ReportType.DataBreach]: {
    title: "dataBreachReport",
    description: "breachDesc",
    route: "breach-report",
    icon: "reportBreach",
  },
};
