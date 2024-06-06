import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ProviderSubscriptionResponse } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

type ComponentData = {
  status?: {
    label: string;
    value: string;
  };
  date?: {
    label: string;
    value: string;
  };
  callout?: {
    severity: "danger" | "warning";
    header: string;
    body: string;
    showReinstatementButton: boolean;
  };
};

@Component({
  selector: "app-subscription-status",
  templateUrl: "subscription-status.component.html",
})
export class SubscriptionStatusComponent {
  @Input({ required: true }) providerSubscriptionResponse: ProviderSubscriptionResponse;
  @Output() reinstatementRequested = new EventEmitter<void>();

  constructor(
    private datePipe: DatePipe,
    private i18nService: I18nService,
  ) {}

  get displayedStatus(): string {
    return this.data.status.value;
  }

  get planName() {
    return this.providerSubscriptionResponse.plans[0];
  }

  get status(): string {
    return this.subscription.status;
  }

  get isExpired() {
    return this.subscription.status !== "active";
  }

  get subscription() {
    return this.providerSubscriptionResponse;
  }

  get data(): ComponentData {
    const defaultStatusLabel = this.i18nService.t("status");

    const nextChargeDateLabel = this.i18nService.t("nextCharge");
    const subscriptionExpiredDateLabel = this.i18nService.t("subscriptionExpired");
    const cancellationDateLabel = this.i18nService.t("cancellationDate");

    switch (this.status) {
      case "free": {
        return {};
      }
      case "trialing": {
        return {
          status: {
            label: defaultStatusLabel,
            value: this.i18nService.t("trial"),
          },
          date: {
            label: nextChargeDateLabel,
            value: this.subscription.currentPeriodEndDate.toDateString(),
          },
        };
      }
      case "active": {
        return {
          status: {
            label: defaultStatusLabel,
            value: this.i18nService.t("active"),
          },
          date: {
            label: nextChargeDateLabel,
            value: this.subscription.currentPeriodEndDate.toDateString(),
          },
        };
      }
      case "past_due": {
        const pastDueText = this.i18nService.t("pastDue");
        const suspensionDate = this.datePipe.transform(
          this.subscription.suspensionDate,
          "mediumDate",
        );
        const calloutBody =
          this.subscription.collectionMethod === "charge_automatically"
            ? this.i18nService.t(
                "pastDueWarningForChargeAutomatically",
                this.subscription.gracePeriod,
                suspensionDate,
              )
            : this.i18nService.t(
                "pastDueWarningForSendInvoice",
                this.subscription.gracePeriod,
                suspensionDate,
              );
        return {
          status: {
            label: defaultStatusLabel,
            value: pastDueText,
          },
          date: {
            label: subscriptionExpiredDateLabel,
            value: this.subscription.unpaidPeriodEndDate,
          },
          callout: {
            severity: "warning",
            header: pastDueText,
            body: calloutBody,
            showReinstatementButton: false,
          },
        };
      }
      case "unpaid": {
        return {
          status: {
            label: defaultStatusLabel,
            value: this.i18nService.t("unpaid"),
          },
          date: {
            label: subscriptionExpiredDateLabel,
            value: this.subscription.currentPeriodEndDate.toDateString(),
          },
          callout: {
            severity: "danger",
            header: this.i18nService.t("unpaidInvoice"),
            body: this.i18nService.t("toReactivateYourSubscription"),
            showReinstatementButton: false,
          },
        };
      }
      case "pending_cancellation": {
        const pendingCancellationText = this.i18nService.t("pendingCancellation");
        return {
          status: {
            label: defaultStatusLabel,
            value: pendingCancellationText,
          },
          date: {
            label: cancellationDateLabel,
            value: this.subscription.currentPeriodEndDate.toDateString(),
          },
          callout: {
            severity: "warning",
            header: pendingCancellationText,
            body: this.i18nService.t("subscriptionPendingCanceled"),
            showReinstatementButton: true,
          },
        };
      }
      case "incomplete_expired":
      case "canceled": {
        const canceledText = this.i18nService.t("canceled");
        return {
          status: {
            label: defaultStatusLabel,
            value: canceledText,
          },
          date: {
            label: cancellationDateLabel,
            value: this.subscription.currentPeriodEndDate.toDateString(),
          },
          callout: {
            severity: "danger",
            header: canceledText,
            body: this.i18nService.t("subscriptionCanceled"),
            showReinstatementButton: false,
          },
        };
      }
    }
  }

  requestReinstatement = () => this.reinstatementRequested.emit();
}
