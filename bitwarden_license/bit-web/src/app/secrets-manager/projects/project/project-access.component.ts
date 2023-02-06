import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, share, startWith, switchMap } from "rxjs";

import { PotentialGranteeView } from "../../models/view/potential-grantee.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";

@Component({
  selector: "sm-project-access",
  templateUrl: "./project-access.component.html",
})
export class ProjectAccessComponent implements OnInit {
  @Input() accessType: "projectPeople" | "projectServiceAccounts";
  @Input() description: string;
  @Input() label: string;
  @Input() hint: string;
  @Input() columnTitle: string;
  @Input() emptyMessage: string;

  protected projectAccessPolicies$: Observable<ProjectAccessPoliciesView>;
  protected potentialGrantees$: Observable<PotentialGranteeView[]>;

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit(): void {
    this.projectAccessPolicies$ = this.accessPolicyService.projectAccessPolicies$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(([_, params]) => {
        return this.accessPolicyService.getProjectAccessPolicies(
          params.organizationId,
          params.projectId
        );
      }),
      share()
    );

    this.potentialGrantees$ = this.accessPolicyService.projectAccessPolicies$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        if (this.accessType == "projectPeople") {
          return await this.accessPolicyService.getPeoplePotentialGrantees(params.organizationId);
        } else {
          return await this.accessPolicyService.getServiceAccountsPotentialGrantees(
            params.organizationId
          );
        }
      }),
      share()
    );
  }
}
