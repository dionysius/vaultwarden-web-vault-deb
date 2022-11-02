import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subject, takeUntil } from "rxjs";

import { StateService } from "@bitwarden/common/abstractions/state.service";

import { ReportVariant, reports, ReportType, ReportEntry } from "../../reports";

@Component({
  selector: "app-org-reports-home",
  templateUrl: "reports-home.component.html",
})
export class ReportsHomeComponent implements OnInit, OnDestroy {
  reports: ReportEntry[];

  homepage = true;
  private destrory$: Subject<void> = new Subject<void>();

  constructor(private stateService: StateService, router: Router) {
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destrory$)
      )
      .subscribe((event) => {
        this.homepage = (event as NavigationEnd).urlAfterRedirects.endsWith("/reports");
      });
  }

  async ngOnInit(): Promise<void> {
    const userHasPremium = await this.stateService.getCanAccessPremium();

    const reportRequiresPremium = userHasPremium
      ? ReportVariant.Enabled
      : ReportVariant.RequiresPremium;

    this.reports = [
      {
        ...reports[ReportType.ExposedPasswords],
        variant: reportRequiresPremium,
      },
      {
        ...reports[ReportType.ReusedPasswords],
        variant: reportRequiresPremium,
      },
      {
        ...reports[ReportType.WeakPasswords],
        variant: reportRequiresPremium,
      },
      {
        ...reports[ReportType.UnsecuredWebsites],
        variant: reportRequiresPremium,
      },
      {
        ...reports[ReportType.Inactive2fa],
        variant: reportRequiresPremium,
      },
    ];
  }

  ngOnDestroy(): void {
    this.destrory$.next();
    this.destrory$.complete();
  }
}
