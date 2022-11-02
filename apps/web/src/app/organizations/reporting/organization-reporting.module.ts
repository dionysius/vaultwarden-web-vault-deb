import { NgModule } from "@angular/core";

import { ReportsSharedModule } from "../../reports";
import { SharedModule } from "../../shared/shared.module";

import { OrganizationReportingRoutingModule } from "./organization-reporting-routing.module";
import { ReportingComponent } from "./reporting.component";
import { ReportsHomeComponent } from "./reports-home.component";

@NgModule({
  imports: [SharedModule, ReportsSharedModule, OrganizationReportingRoutingModule],
  declarations: [ReportsHomeComponent, ReportingComponent],
})
export class OrganizationReportingModule {}
