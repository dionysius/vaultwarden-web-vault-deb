import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, map, Observable, startWith, Subject, switchMap, takeUntil } from "rxjs";

import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  GroupServiceAccountAccessPolicyView,
  ServiceAccountAccessPoliciesView,
  UserServiceAccountAccessPolicyView,
} from "../../models/view/access-policy.view";
import { AccessPolicyService } from "../../shared/access-policies/access-policy.service";
import {
  AccessSelectorComponent,
  AccessSelectorRowView,
} from "../../shared/access-policies/access-selector.component";

@Component({
  selector: "sm-service-account-people",
  templateUrl: "./service-account-people.component.html",
})
export class ServiceAccountPeopleComponent {
  private destroy$ = new Subject<void>();
  private serviceAccountId: string;

  protected rows$: Observable<AccessSelectorRowView[]> =
    this.accessPolicyService.serviceAccountAccessPolicyChanges$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(([_, params]) =>
        this.accessPolicyService.getServiceAccountAccessPolicies(params.serviceAccountId)
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
            static: true,
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
            static: true,
          });
        });

        return rows;
      })
    );

  protected handleCreateAccessPolicies(selected: SelectItemView[]) {
    const serviceAccountAccessPoliciesView = new ServiceAccountAccessPoliciesView();
    serviceAccountAccessPoliciesView.userAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "user")
      .map((filtered) => {
        const view = new UserServiceAccountAccessPolicyView();
        view.grantedServiceAccountId = this.serviceAccountId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = true;
        return view;
      });

    serviceAccountAccessPoliciesView.groupAccessPolicies = selected
      .filter((selection) => AccessSelectorComponent.getAccessItemType(selection) === "group")
      .map((filtered) => {
        const view = new GroupServiceAccountAccessPolicyView();
        view.grantedServiceAccountId = this.serviceAccountId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = true;
        return view;
      });

    return this.accessPolicyService.createServiceAccountAccessPolicies(
      this.serviceAccountId,
      serviceAccountAccessPoliciesView
    );
  }

  constructor(private route: ActivatedRoute, private accessPolicyService: AccessPolicyService) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.serviceAccountId = params.serviceAccountId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
