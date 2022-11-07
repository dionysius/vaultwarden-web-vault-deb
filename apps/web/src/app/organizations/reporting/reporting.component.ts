import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "app-org-reporting",
  templateUrl: "reporting.component.html",
})
export class ReportingComponent implements OnInit, OnDestroy {
  organization: Organization;
  showLeftNav = true;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organization = await this.organizationService.get(params.organizationId);
          this.showLeftNav =
            this.organization.canAccessEventLogs && this.organization.canAccessReports;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
