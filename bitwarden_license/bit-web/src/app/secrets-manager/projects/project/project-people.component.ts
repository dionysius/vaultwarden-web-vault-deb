import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { SelectItemView } from "@bitwarden/components";

import {
  GroupProjectAccessPolicyView,
  ProjectAccessPoliciesView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import {
  AccessSelectorComponent,
  AccessSelectorRowView,
} from "../../shared/access-policies/access-selector.component";

@Component({
  selector: "sm-project-people",
  templateUrl: "./project-people.component.html",
})
export class ProjectPeopleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private organizationId: string;
  private projectId: string;

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.projectAccessPolicyChanges$.pipe(
      startWith(null),
      switchMap(() =>
        this.accessPolicyService.getProjectAccessPolicies(this.organizationId, this.projectId)
      ),
      map((policies) => {
        const rows: AccessSelectorRowView[] = [];
        policies.userAccessPolicies.forEach((policy) => {
          rows.push({
            type: "user",
            name: policy.organizationUserName,
            id: policy.organizationUserId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            icon: AccessSelectorComponent.userIcon,
          });
        });

        policies.groupAccessPolicies.forEach((policy) => {
          rows.push({
            type: "group",
            name: policy.groupName,
            id: policy.groupId,
            accessPolicyId: policy.id,
            read: policy.read,
            write: policy.write,
            icon: AccessSelectorComponent.groupIcon,
          });
        });
        return rows;
      })
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const projectAccessPoliciesView = new ProjectAccessPoliciesView();
    projectAccessPoliciesView.userAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "user")
      .map((filtered) => {
        const view = new UserProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    projectAccessPoliciesView.groupAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "group")
      .map((filtered) => {
        const view = new GroupProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    return this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      projectAccessPoliciesView
    );
  }

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
