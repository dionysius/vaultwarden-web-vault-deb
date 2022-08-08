import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { BreachReportComponent } from "./pages/breach-report.component";
import { ExposedPasswordsReportComponent } from "./pages/exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "./pages/inactive-two-factor-report.component";
import { ReportsHomeComponent } from "./pages/reports-home.component";
import { ReusedPasswordsReportComponent } from "./pages/reused-passwords-report.component";
import { UnsecuredWebsitesReportComponent } from "./pages/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./pages/weak-passwords-report.component";
import { ReportCardComponent } from "./report-card/report-card.component";
import { ReportListComponent } from "./report-list/report-list.component";
import { ReportsLayoutComponent } from "./reports-layout.component";
import { ReportsRoutingModule } from "./reports-routing.module";

@NgModule({
  imports: [CommonModule, SharedModule, ReportsRoutingModule],
  declarations: [
    BreachReportComponent,
    ExposedPasswordsReportComponent,
    InactiveTwoFactorReportComponent,
    ReportCardComponent,
    ReportListComponent,
    ReportsLayoutComponent,
    ReportsHomeComponent,
    ReusedPasswordsReportComponent,
    UnsecuredWebsitesReportComponent,
    WeakPasswordsReportComponent,
    WeakPasswordsReportComponent,
  ],
})
export class ReportsModule {}
