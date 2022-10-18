import { SelectionReadOnlyRequest } from "./selection-read-only.request";

export class GroupRequest {
  name: string;
  accessAll: boolean;
  externalId: string;
  collections: SelectionReadOnlyRequest[] = [];
}
