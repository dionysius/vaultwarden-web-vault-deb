import { PlanSponsorshipType } from "../../../../billing/enums/plan-sponsorship-type";

export class OrganizationSponsorshipRedeemRequest {
  planSponsorshipType: PlanSponsorshipType;
  sponsoredOrganizationId: string;
}
