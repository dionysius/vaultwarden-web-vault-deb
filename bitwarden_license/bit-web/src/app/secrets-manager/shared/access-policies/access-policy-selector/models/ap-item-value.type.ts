import {
  UserProjectAccessPolicyView,
  GroupProjectAccessPolicyView,
  UserServiceAccountAccessPolicyView,
  GroupServiceAccountAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
} from "../../../../models/view/access-policies/access-policy.view";
import { ProjectPeopleAccessPoliciesView } from "../../../../models/view/access-policies/project-people-access-policies.view";
import { ProjectServiceAccountsAccessPoliciesView } from "../../../../models/view/access-policies/project-service-accounts-access-policies.view";
import {
  ServiceAccountGrantedPoliciesView,
  ServiceAccountProjectPolicyPermissionDetailsView,
} from "../../../../models/view/access-policies/service-account-granted-policies.view";
import { ServiceAccountPeopleAccessPoliciesView } from "../../../../models/view/access-policies/service-account-people-access-policies.view";

import { ApItemEnum } from "./enums/ap-item.enum";
import { ApPermissionEnum, ApPermissionEnumUtil } from "./enums/ap-permission.enum";

export type ApItemValueType = {
  id: string;
  type: ApItemEnum;
  permission: ApPermissionEnum;
  currentUserInGroup?: boolean;
  currentUser?: boolean;
};

export function convertToProjectPeopleAccessPoliciesView(
  projectId: string,
  selectedPolicyValues: ApItemValueType[],
): ProjectPeopleAccessPoliciesView {
  const view = new ProjectPeopleAccessPoliciesView();
  view.userAccessPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.User)
    .map((filtered) => {
      const policyView = new UserProjectAccessPolicyView();
      policyView.grantedProjectId = projectId;
      policyView.organizationUserId = filtered.id;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);
      return policyView;
    });

  view.groupAccessPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.Group)
    .map((filtered) => {
      const policyView = new GroupProjectAccessPolicyView();
      policyView.grantedProjectId = projectId;
      policyView.groupId = filtered.id;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);
      return policyView;
    });
  return view;
}

export function convertToServiceAccountPeopleAccessPoliciesView(
  serviceAccountId: string,
  selectedPolicyValues: ApItemValueType[],
): ServiceAccountPeopleAccessPoliciesView {
  const view = new ServiceAccountPeopleAccessPoliciesView();
  view.userAccessPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.User)
    .map((filtered) => {
      const policyView = new UserServiceAccountAccessPolicyView();
      policyView.grantedServiceAccountId = serviceAccountId;
      policyView.organizationUserId = filtered.id;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);
      policyView.currentUser = filtered.currentUser;
      return policyView;
    });

  view.groupAccessPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.Group)
    .map((filtered) => {
      const policyView = new GroupServiceAccountAccessPolicyView();
      policyView.grantedServiceAccountId = serviceAccountId;
      policyView.groupId = filtered.id;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);
      return policyView;
    });
  return view;
}

export function convertToServiceAccountGrantedPoliciesView(
  serviceAccountId: string,
  selectedPolicyValues: ApItemValueType[],
): ServiceAccountGrantedPoliciesView {
  const view = new ServiceAccountGrantedPoliciesView();

  view.grantedProjectPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.Project)
    .map((filtered) => {
      const detailView = new ServiceAccountProjectPolicyPermissionDetailsView();
      const policyView = new ServiceAccountProjectAccessPolicyView();
      policyView.serviceAccountId = serviceAccountId;
      policyView.grantedProjectId = filtered.id;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);

      detailView.accessPolicy = policyView;
      return detailView;
    });

  return view;
}

export function convertToProjectServiceAccountsAccessPoliciesView(
  projectId: string,
  selectedPolicyValues: ApItemValueType[],
): ProjectServiceAccountsAccessPoliciesView {
  const view = new ProjectServiceAccountsAccessPoliciesView();

  view.serviceAccountAccessPolicies = selectedPolicyValues
    .filter((x) => x.type == ApItemEnum.ServiceAccount)
    .map((filtered) => {
      const policyView = new ServiceAccountProjectAccessPolicyView();
      policyView.serviceAccountId = filtered.id;
      policyView.grantedProjectId = projectId;
      policyView.read = ApPermissionEnumUtil.toRead(filtered.permission);
      policyView.write = ApPermissionEnumUtil.toWrite(filtered.permission);
      return policyView;
    });

  return view;
}
