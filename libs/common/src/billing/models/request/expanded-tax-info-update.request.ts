import { TaxInfoUpdateRequest } from "./tax-info-update.request";

export class ExpandedTaxInfoUpdateRequest extends TaxInfoUpdateRequest {
  taxId: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
}
