import { Component, EventEmitter, Input, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, Validators } from "@angular/forms";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationSubscriptionUpdateRequest } from "@bitwarden/common/billing/models/request/organization-subscription-update.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { ToastService } from "@bitwarden/components";

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

  adjustSubscriptionForm = this.formBuilder.group({
    newSeatCount: [0, [Validators.min(0)]],
    limitSubscription: [false],
    newMaxSeats: [0, [Validators.min(0)]],
  });

  constructor(
    private i18nService: I18nService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
  ) {
    this.adjustSubscriptionForm.patchValue({
      newSeatCount: this.currentSeatCount,
      limitSubscription: this.maxAutoscaleSeats != null,
      newMaxSeats: this.maxAutoscaleSeats,
    });
    this.adjustSubscriptionForm
      .get("limitSubscription")
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value: boolean) => {
        if (value) {
          this.adjustSubscriptionForm
            .get("newMaxSeats")
            .addValidators([
              Validators.min(
                this.adjustSubscriptionForm.value.newSeatCount == null
                  ? 1
                  : this.adjustSubscriptionForm.value.newSeatCount,
              ),
              Validators.required,
            ]);
        }
        this.adjustSubscriptionForm.get("newMaxSeats").updateValueAndValidity();
      });
  }

  submit = async () => {
    this.adjustSubscriptionForm.markAllAsTouched();
    if (this.adjustSubscriptionForm.invalid) {
      return;
    }
    const request = new OrganizationSubscriptionUpdateRequest(
      this.additionalSeatCount,
      this.adjustSubscriptionForm.value.newMaxSeats,
    );
    await this.organizationApiService.updatePasswordManagerSeats(this.organizationId, request);

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("subscriptionUpdated"),
    });

    this.onAdjusted.emit();
  };

  limitSubscriptionChanged() {
    if (!this.adjustSubscriptionForm.value.limitSubscription) {
      this.adjustSubscriptionForm.value.newMaxSeats = null;
    }
  }

  get additionalSeatCount(): number {
    return this.adjustSubscriptionForm.value.newSeatCount
      ? this.adjustSubscriptionForm.value.newSeatCount - this.currentSeatCount
      : 0;
  }

  get maxSeatTotal(): number {
    return Math.abs((this.adjustSubscriptionForm.value.newMaxSeats ?? 0) * this.seatPrice);
  }

  get seatTotalCost(): number {
    return Math.abs(this.adjustSubscriptionForm.value.newSeatCount * this.seatPrice);
  }

  get limitSubscription(): boolean {
    return this.adjustSubscriptionForm.value.limitSubscription;
  }
}
