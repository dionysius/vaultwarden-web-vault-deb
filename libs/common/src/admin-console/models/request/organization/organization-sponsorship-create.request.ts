import { PlanSponsorshipType } from "../../../../billing/enums/plan-sponsorship-type";

export class OrganizationSponsorshipCreateRequest {
  sponsoredEmail: string;
  planSponsorshipType: PlanSponsorshipType;
  friendlyName: string;
}
