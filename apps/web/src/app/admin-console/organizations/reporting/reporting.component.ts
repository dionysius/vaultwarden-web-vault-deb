import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, shareReplay, startWith, switchMap } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";

@Component({
  selector: "app-org-reporting",
  templateUrl: "reporting.component.html",
})
export class ReportingComponent implements OnInit {
  organization$: Observable<Organization>;
  showLeftNav$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
  ) {}

  ngOnInit() {
    this.organization$ = this.route.params.pipe(
      switchMap((params) => this.organizationService.get$(params.organizationId)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.showLeftNav$ = this.organization$.pipe(
      map((o) => o.canAccessEventLogs && o.canAccessReports),
      startWith(true),
    );
  }
}
