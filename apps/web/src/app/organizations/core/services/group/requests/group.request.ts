import { SelectionReadOnlyRequest } from "@bitwarden/common/models/request/selection-read-only.request";

export class GroupRequest {
  name: string;
  accessAll: boolean;
  externalId: string;
  collections: SelectionReadOnlyRequest[] = [];
  users: string[] = [];
}
