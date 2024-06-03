export class BitPayInvoiceRequest {
  userId: string;
  organizationId: string;
  providerId: string;
  credit: boolean;
  amount: number;
  returnUrl: string;
  name: string;
  email: string;
}
