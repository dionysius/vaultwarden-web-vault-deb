import { TaxInfoUpdateRequest } from "./tax-info-update.request";

export class OrganizationTaxInfoUpdateRequest extends TaxInfoUpdateRequest {
  taxId: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
}
