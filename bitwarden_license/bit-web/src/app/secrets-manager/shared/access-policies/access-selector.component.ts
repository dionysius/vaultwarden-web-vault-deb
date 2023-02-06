import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import {
  combineLatestWith,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  BaseAccessPolicyView,
  GroupProjectAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  UserProjectAccessPolicyView,
} from "../../models/view/access-policy.view";
import { PotentialGranteeView } from "../../models/view/potential-grantee.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import { AccessPolicyService } from "./access-policy.service";

type RowItemView = {
  type: "user" | "group" | "serviceAccount";
  name: string;
  id: string;
  read: boolean;
  write: boolean;
  icon: string;
};

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit, OnDestroy {
  @Input() label: string;
  @Input() hint: string;
  @Input() tableType: "projectPeople" | "projectServiceAccounts";
  @Input() columnTitle: string;
  @Input() emptyMessage: string;

  private readonly userIcon = "bwi-user";
  private readonly groupIcon = "bwi-family";
  private readonly serviceAccountIcon = "bwi-wrench";

  @Input() projectAccessPolicies$: Observable<ProjectAccessPoliciesView>;
  @Input() potentialGrantees$: Observable<PotentialGranteeView[]>;

  private projectId: string;
  private organizationId: string;
  private destroy$: Subject<void> = new Subject<void>();

  protected loading = true;
  protected formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required]),
  });

  protected selectItemsView$: Observable<SelectItemView[]>;
  protected rows$: Observable<RowItemView[]>;

  constructor(
    private route: ActivatedRoute,
    private accessPolicyService: AccessPolicyService,
    private validationService: ValidationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });

    this.selectItemsView$ = this.projectAccessPolicies$.pipe(
      distinctUntilChanged(
        (prev, curr) => this.getAccessPoliciesCount(curr) === this.getAccessPoliciesCount(prev)
      ),
      combineLatestWith(this.potentialGrantees$),
      map(([projectAccessPolicies, potentialGrantees]) =>
        this.createSelectView(projectAccessPolicies, potentialGrantees)
      ),
      tap(() => {
        this.loading = false;
        this.formGroup.enable();
        this.formGroup.reset();
      })
    );

    this.rows$ = this.projectAccessPolicies$.pipe(
      map((policies) => {
        const rowData: RowItemView[] = [];

        if (this.tableType === "projectPeople") {
          policies.userAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "user",
              name: policy.organizationUserName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: this.userIcon,
            });
          });

          policies.groupAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "group",
              name: policy.groupName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: this.groupIcon,
            });
          });
        }

        if (this.tableType === "projectServiceAccounts") {
          policies.serviceAccountAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "serviceAccount",
              name: policy.serviceAccountName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: this.serviceAccountIcon,
            });
          });
        }
        return rowData;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    this.loading = true;
    this.formGroup.disable();

    this.accessPolicyService.createProjectAccessPolicies(
      this.organizationId,
      this.projectId,
      this.createProjectAccessPoliciesViewFromSelected()
    );

    return firstValueFrom(this.selectItemsView$);
  };

  private createSelectView = (
    projectAccessPolicies: ProjectAccessPoliciesView,
    potentialGrantees: PotentialGranteeView[]
  ): SelectItemView[] => {
    const selectItemsView = potentialGrantees.map((granteeView) => {
      let icon: string;
      let listName: string;
      if (granteeView.type === "user") {
        icon = this.userIcon;
        listName = `${granteeView.name} (${granteeView.email})`;
      } else if (granteeView.type === "group") {
        icon = this.groupIcon;
        listName = granteeView.name;
      } else {
        icon = this.serviceAccountIcon;
        listName = granteeView.name;
      }
      return {
        icon: icon,
        id: granteeView.id,
        labelName: granteeView.name,
        listName: listName,
      };
    });
    return this.filterExistingAccessPolicies(selectItemsView, projectAccessPolicies);
  };

  private createProjectAccessPoliciesViewFromSelected(): ProjectAccessPoliciesView {
    const projectAccessPoliciesView = new ProjectAccessPoliciesView();
    projectAccessPoliciesView.userAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.userIcon)
      ?.map((filtered) => {
        const view = new UserProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.organizationUserId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    projectAccessPoliciesView.groupAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.groupIcon)
      ?.map((filtered) => {
        const view = new GroupProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.groupId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });

    projectAccessPoliciesView.serviceAccountAccessPolicies = this.formGroup.value.multiSelect
      ?.filter((selection) => selection.icon === this.serviceAccountIcon)
      ?.map((filtered) => {
        const view = new ServiceAccountProjectAccessPolicyView();
        view.grantedProjectId = this.projectId;
        view.serviceAccountId = filtered.id;
        view.read = true;
        view.write = false;
        return view;
      });
    return projectAccessPoliciesView;
  }

  private getAccessPoliciesCount(projectAccessPoliciesView: ProjectAccessPoliciesView) {
    return (
      projectAccessPoliciesView.groupAccessPolicies.length +
      projectAccessPoliciesView.serviceAccountAccessPolicies.length +
      projectAccessPoliciesView.userAccessPolicies.length
    );
  }

  private filterExistingAccessPolicies(
    potentialGrantees: SelectItemView[],
    projectAccessPolicies: ProjectAccessPoliciesView
  ): SelectItemView[] {
    return potentialGrantees
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.serviceAccountAccessPolicies.some(
            (ap) => ap.serviceAccountId === potentialGrantee.id
          )
      )
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.userAccessPolicies.some(
            (ap) => ap.organizationUserId === potentialGrantee.id
          )
      )
      .filter(
        (potentialGrantee) =>
          !projectAccessPolicies.groupAccessPolicies.some(
            (ap) => ap.groupId === potentialGrantee.id
          )
      );
  }

  async updateAccessPolicy(target: any, accessPolicyId: string): Promise<void> {
    try {
      const accessPolicyView = new BaseAccessPolicyView();
      accessPolicyView.id = accessPolicyId;
      if (target.value === "canRead") {
        accessPolicyView.read = true;
        accessPolicyView.write = false;
      } else if (target.value === "canWrite") {
        accessPolicyView.read = false;
        accessPolicyView.write = true;
      } else if (target.value === "canReadWrite") {
        accessPolicyView.read = true;
        accessPolicyView.write = true;
      }

      await this.accessPolicyService.updateAccessPolicy(accessPolicyView);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  delete = (accessPolicyId: string) => async () => {
    this.loading = true;
    this.formGroup.disable();
    await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
    return firstValueFrom(this.selectItemsView$);
  };
}
