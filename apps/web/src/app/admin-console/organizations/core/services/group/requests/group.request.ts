import { SelectionReadOnlyRequest } from "@bitwarden/common/admin-console/models/request/selection-read-only.request";

export class GroupRequest {
  name: string;
  collections: SelectionReadOnlyRequest[] = [];
  users: string[] = [];
}
