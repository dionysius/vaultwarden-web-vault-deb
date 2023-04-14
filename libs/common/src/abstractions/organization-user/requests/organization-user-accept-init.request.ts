import { OrganizationKeysRequest } from "../../../admin-console/models/request/organization-keys.request";

export class OrganizationUserAcceptInitRequest {
  token: string;
  key: string;
  keys: OrganizationKeysRequest;
  collectionName: string;
}
