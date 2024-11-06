import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AsyncActionsModule, ButtonModule, TabsModule } from "@bitwarden/components";

import { HeaderModule } from "../../layouts/header/header.module";

import { AllApplicationsComponent } from "./all-applications.component";
import { CriticalApplicationsComponent } from "./critical-applications.component";
import { NotifiedMembersTableComponent } from "./notified-members-table.component";
import { PasswordHealthMembersURIComponent } from "./password-health-members-uri.component";
import { PasswordHealthMembersComponent } from "./password-health-members.component";
import { PasswordHealthComponent } from "./password-health.component";

export enum RiskInsightsTabType {
  AllApps = 0,
  CriticalApps = 1,
  NotifiedMembers = 2,
}

@Component({
  standalone: true,
  templateUrl: "./risk-insights.component.html",
  imports: [
    AllApplicationsComponent,
    AsyncActionsModule,
    ButtonModule,
    CommonModule,
    CriticalApplicationsComponent,
    JslibModule,
    HeaderModule,
    PasswordHealthComponent,
    PasswordHealthMembersComponent,
    PasswordHealthMembersURIComponent,
    NotifiedMembersTableComponent,
    TabsModule,
  ],
})
export class RiskInsightsComponent {
  tabIndex: RiskInsightsTabType;
  dataLastUpdated = new Date();

  apps: any[] = [];
  criticalApps: any[] = [];
  notifiedMembers: any[] = [];

  async refreshData() {
    // TODO: Implement
    return new Promise((resolve) =>
      setTimeout(() => {
        this.dataLastUpdated = new Date();
        resolve(true);
      }, 1000),
    );
  }

  onTabChange = async (newIndex: number) => {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tabIndex: newIndex },
      queryParamsHandling: "merge",
    });
  };

  constructor(
    protected route: ActivatedRoute,
    private router: Router,
  ) {
    route.queryParams.pipe(takeUntilDestroyed()).subscribe(({ tabIndex }) => {
      this.tabIndex = !isNaN(tabIndex) ? tabIndex : RiskInsightsTabType.AllApps;
    });
  }
}
