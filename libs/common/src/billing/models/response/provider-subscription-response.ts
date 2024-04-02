import { BaseResponse } from "../../../models/response/base.response";

export class ProviderSubscriptionResponse extends BaseResponse {
  status: string;
  currentPeriodEndDate: Date;
  discountPercentage?: number | null;
  plans: Plans[] = [];

  constructor(response: any) {
    super(response);
    this.status = this.getResponseProperty("status");
    this.currentPeriodEndDate = new Date(this.getResponseProperty("currentPeriodEndDate"));
    this.discountPercentage = this.getResponseProperty("discountPercentage");
    const plans = this.getResponseProperty("plans");
    if (plans != null) {
      this.plans = plans.map((i: any) => new Plans(i));
    }
  }
}

export class Plans extends BaseResponse {
  planName: string;
  seatMinimum: number;
  assignedSeats: number;
  purchasedSeats: number;
  cost: number;
  cadence: string;

  constructor(response: any) {
    super(response);
    this.planName = this.getResponseProperty("PlanName");
    this.seatMinimum = this.getResponseProperty("SeatMinimum");
    this.assignedSeats = this.getResponseProperty("AssignedSeats");
    this.purchasedSeats = this.getResponseProperty("PurchasedSeats");
    this.cost = this.getResponseProperty("Cost");
    this.cadence = this.getResponseProperty("Cadence");
  }
}
