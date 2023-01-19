import { OrganizationUserUserDetailsResponse } from "@bitwarden/common/abstractions/organization-user/responses";
import { OrganizationUserStatusType } from "@bitwarden/common/enums/organizationUserStatusType";
import { OrganizationUserType } from "@bitwarden/common/enums/organizationUserType";
import { PermissionsApi } from "@bitwarden/common/models/api/permissions.api";

import { CollectionAccessSelectionView } from "./collection-access-selection.view";

export class OrganizationUserView {
  id: string;
  userId: string;
  type: OrganizationUserType;
  status: OrganizationUserStatusType;
  accessAll: boolean;
  permissions: PermissionsApi;
  resetPasswordEnrolled: boolean;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  usesKeyConnector: boolean;

  collections: CollectionAccessSelectionView[] = [];
  groups: string[] = [];

  groupNames: string[] = [];
  collectionNames: string[] = [];

  static fromResponse(response: OrganizationUserUserDetailsResponse): OrganizationUserView {
    const view = Object.assign(new OrganizationUserView(), response) as OrganizationUserView;

    if (response.collections != undefined) {
      view.collections = response.collections.map((c) => new CollectionAccessSelectionView(c));
    }

    if (response.groups != undefined) {
      view.groups = response.groups;
    }

    return view;
  }
}
