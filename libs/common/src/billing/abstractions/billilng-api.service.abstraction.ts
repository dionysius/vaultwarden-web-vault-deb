import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";

export abstract class BillingApiServiceAbstraction {
  cancelOrganizationSubscription: (
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ) => Promise<void>;
  cancelPremiumUserSubscription: (request: SubscriptionCancellationRequest) => Promise<void>;
}
