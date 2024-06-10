import { OrganizationUserType } from "../../../enums";
import { PermissionsApi } from "../../../models/api/permissions.api";
import { SelectionReadOnlyRequest } from "../../../models/request/selection-read-only.request";

export class OrganizationUserUpdateRequest {
  type: OrganizationUserType;
  accessSecretsManager: boolean;
  collections: SelectionReadOnlyRequest[] = [];
  groups: string[] = [];
  permissions: PermissionsApi;
}
