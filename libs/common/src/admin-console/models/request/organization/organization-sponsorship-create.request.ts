import { PlanSponsorshipType } from "../../../../billing/enums";

export class OrganizationSponsorshipCreateRequest {
  sponsoredEmail: string;
  planSponsorshipType: PlanSponsorshipType;
  friendlyName: string;
}
