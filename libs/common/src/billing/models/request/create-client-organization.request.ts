import { OrganizationKeysRequest } from "../../../admin-console/models/request/organization-keys.request";
import { PlanType } from "../../../billing/enums";

export class CreateClientOrganizationRequest {
  name: string;
  ownerEmail: string;
  planType: PlanType;
  seats: number;
  key: string;
  keyPair: OrganizationKeysRequest;
  collectionName: string;
}
