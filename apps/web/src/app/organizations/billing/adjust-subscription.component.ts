import { Component, EventEmitter, Input, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationSubscriptionUpdateRequest } from "@bitwarden/common/models/request/organization-subscription-update.request";

@Component({
  selector: "app-adjust-subscription",
  templateUrl: "adjust-subscription.component.html",
})
export class AdjustSubscription {
  @Input() organizationId: string;
  @Input() maxAutoscaleSeats: number;
  @Input() currentSeatCount: number;
  @Input() seatPrice = 0;
  @Input() interval = "year";
  @Output() onAdjusted = new EventEmitter();

  formPromise: Promise<void>;
  limitSubscription: boolean;
  newSeatCount: number;
  newMaxSeats: number;

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  ngOnInit() {
    this.limitSubscription = this.maxAutoscaleSeats != null;
    this.newSeatCount = this.currentSeatCount;
    this.newMaxSeats = this.maxAutoscaleSeats;
  }

  async submit() {
    try {
      const seatAdjustment = this.newSeatCount - this.currentSeatCount;
      const request = new OrganizationSubscriptionUpdateRequest(seatAdjustment, this.newMaxSeats);
      this.formPromise = this.organizationApiService.updateSubscription(
        this.organizationId,
        request
      );

      await this.formPromise;

      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("subscriptionUpdated")
      );
    } catch (e) {
      this.logService.error(e);
    }
    this.onAdjusted.emit();
  }

  limitSubscriptionChanged() {
    if (!this.limitSubscription) {
      this.newMaxSeats = null;
    }
  }

  get adjustedSeatTotal(): number {
    return this.newSeatCount * this.seatPrice;
  }

  get maxSeatTotal(): number {
    return this.newMaxSeats * this.seatPrice;
  }
}
