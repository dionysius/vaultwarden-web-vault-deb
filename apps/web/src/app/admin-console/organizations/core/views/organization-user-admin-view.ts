import {
  OrganizationUserStatusType,
  OrganizationUserType,
} from "@bitwarden/common/admin-console/enums";
import { PermissionsApi } from "@bitwarden/common/admin-console/models/api/permissions.api";

import { CollectionAccessSelectionView } from "./collection-access-selection.view";

export class OrganizationUserAdminView {
  id: string;
  userId: string;
  organizationId: string;
  type: OrganizationUserType;
  status: OrganizationUserStatusType;
  externalId: string;
  /**
   * @deprecated
   * To be removed after Flexible Collections.
   * This will always return `false` if Flexible Collections is enabled.
   **/
  accessAll: boolean;
  permissions: PermissionsApi;
  resetPasswordEnrolled: boolean;
  hasMasterPassword: boolean;

  collections: CollectionAccessSelectionView[] = [];
  groups: string[] = [];

  accessSecretsManager: boolean;
}
