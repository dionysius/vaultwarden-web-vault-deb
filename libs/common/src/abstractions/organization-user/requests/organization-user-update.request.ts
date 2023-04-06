import { OrganizationUserType } from "../../../admin-console/enums";
import { PermissionsApi } from "../../../admin-console/models/api/permissions.api";
import { SelectionReadOnlyRequest } from "../../../admin-console/models/request/selection-read-only.request";

export class OrganizationUserUpdateRequest {
  type: OrganizationUserType;
  accessAll: boolean;
  accessSecretsManager: boolean;
  collections: SelectionReadOnlyRequest[] = [];
  groups: string[] = [];
  permissions: PermissionsApi;
}
