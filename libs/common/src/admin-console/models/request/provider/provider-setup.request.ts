import { ExpandedTaxInfoUpdateRequest } from "../../../../billing/models/request/expanded-tax-info-update.request";

export class ProviderSetupRequest {
  name: string;
  businessName: string;
  billingEmail: string;
  token: string;
  key: string;
  taxInfo: ExpandedTaxInfoUpdateRequest;
}
