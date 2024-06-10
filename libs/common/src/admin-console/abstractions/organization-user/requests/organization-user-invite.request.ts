import { OrganizationUserType } from "../../../enums";
import { PermissionsApi } from "../../../models/api/permissions.api";
import { SelectionReadOnlyRequest } from "../../../models/request/selection-read-only.request";

export class OrganizationUserInviteRequest {
  emails: string[] = [];
  type: OrganizationUserType;
  accessSecretsManager: boolean;
  collections: SelectionReadOnlyRequest[] = [];
  groups: string[];
  permissions: PermissionsApi;
}
