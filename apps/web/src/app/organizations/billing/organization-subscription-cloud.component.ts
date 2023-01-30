import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { ModalConfig, ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationApiKeyType } from "@bitwarden/common/enums/organizationApiKeyType";
import { PlanType } from "@bitwarden/common/enums/planType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/models/response/organization-subscription.response";

import {
  BillingSyncApiKeyComponent,
  BillingSyncApiModalData,
} from "./billing-sync-api-key.component";

@Component({
  selector: "app-org-subscription-cloud",
  templateUrl: "organization-subscription-cloud.component.html",
})
export class OrganizationSubscriptionCloudComponent implements OnInit, OnDestroy {
  sub: OrganizationSubscriptionResponse;
  organizationId: string;
  userOrg: Organization;
  showChangePlan = false;
  showDownloadLicense = false;
  adjustStorageAdd = true;
  showAdjustStorage = false;
  hasBillingSyncToken: boolean;

  firstLoaded = false;
  loading: boolean;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService,
    private modalService: ModalService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (this.route.snapshot.queryParamMap.get("upgrade")) {
      this.changePlan();
    }

    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organizationId = params.organizationId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.userOrg = this.organizationService.get(this.organizationId);
    if (this.userOrg.canManageBilling) {
      this.sub = await this.organizationApiService.getSubscription(this.organizationId);
    }

    const apiKeyResponse = await this.organizationApiService.getApiKeyInformation(
      this.organizationId
    );
    this.hasBillingSyncToken = apiKeyResponse.data.some(
      (i) => i.keyType === OrganizationApiKeyType.BillingSync
    );

    this.loading = false;
  }

  get subscription() {
    return this.sub != null ? this.sub.subscription : null;
  }

  get nextInvoice() {
    return this.sub != null ? this.sub.upcomingInvoice : null;
  }

  get storagePercentage() {
    return this.sub != null && this.sub.maxStorageGb
      ? +(100 * (this.sub.storageGb / this.sub.maxStorageGb)).toFixed(2)
      : 0;
  }

  get storageProgressWidth() {
    return this.storagePercentage < 5 ? 5 : 0;
  }

  get billingInterval() {
    const monthly = !this.sub.plan.isAnnual;
    return monthly ? "month" : "year";
  }

  get storageGbPrice() {
    return this.sub.plan.additionalStoragePricePerGb;
  }

  get seatPrice() {
    return this.sub.plan.seatPrice;
  }

  get seats() {
    return this.sub.seats;
  }

  get maxAutoscaleSeats() {
    return this.sub.maxAutoscaleSeats;
  }

  get canAdjustSeats() {
    return this.sub.plan.hasAdditionalSeatsOption;
  }

  get isSponsoredSubscription(): boolean {
    return this.sub.subscription?.items.some((i) => i.sponsoredSubscriptionItem);
  }

  get canDownloadLicense() {
    return (
      (this.sub.planType !== PlanType.Free && this.subscription == null) ||
      (this.subscription != null && !this.subscription.cancelled)
    );
  }

  get canManageBillingSync() {
    return (
      this.sub.planType === PlanType.EnterpriseAnnually ||
      this.sub.planType === PlanType.EnterpriseMonthly ||
      this.sub.planType === PlanType.EnterpriseAnnually2019 ||
      this.sub.planType === PlanType.EnterpriseMonthly2019
    );
  }

  get subscriptionDesc() {
    if (this.sub.planType === PlanType.Free) {
      return this.i18nService.t("subscriptionFreePlan", this.sub.seats.toString());
    } else if (
      this.sub.planType === PlanType.FamiliesAnnually ||
      this.sub.planType === PlanType.FamiliesAnnually2019
    ) {
      if (this.isSponsoredSubscription) {
        return this.i18nService.t("subscriptionSponsoredFamiliesPlan", this.sub.seats.toString());
      } else {
        return this.i18nService.t("subscriptionFamiliesPlan", this.sub.seats.toString());
      }
    } else if (this.sub.maxAutoscaleSeats === this.sub.seats && this.sub.seats != null) {
      return this.i18nService.t("subscriptionMaxReached", this.sub.seats.toString());
    } else if (this.sub.maxAutoscaleSeats == null) {
      return this.i18nService.t("subscriptionUserSeatsUnlimitedAutoscale");
    } else {
      return this.i18nService.t(
        "subscriptionUserSeatsLimitedAutoscale",
        this.sub.maxAutoscaleSeats.toString()
      );
    }
  }

  get subscriptionMarkedForCancel() {
    return (
      this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate
    );
  }

  cancel = async () => {
    if (this.loading) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("cancelConfirmation"),
      this.i18nService.t("cancelSubscription"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.organizationApiService.cancel(this.organizationId);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("canceledSubscription")
      );
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  };

  reinstate = async () => {
    if (this.loading) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("reinstateConfirmation"),
      this.i18nService.t("reinstateSubscription"),
      this.i18nService.t("yes"),
      this.i18nService.t("cancel")
    );
    if (!confirmed) {
      return;
    }

    try {
      await this.organizationApiService.reinstate(this.organizationId);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("reinstated"));
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  };

  async changePlan() {
    this.showChangePlan = !this.showChangePlan;
  }

  closeChangePlan() {
    this.showChangePlan = false;
  }

  downloadLicense() {
    this.showDownloadLicense = !this.showDownloadLicense;
  }

  async manageBillingSync() {
    const modalConfig: ModalConfig<BillingSyncApiModalData> = {
      data: {
        organizationId: this.organizationId,
        hasBillingToken: this.hasBillingSyncToken,
      },
    };
    const modalRef = this.modalService.open(BillingSyncApiKeyComponent, modalConfig);

    modalRef.onClosed
      .pipe(
        concatMap(async () => {
          this.load();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  closeDownloadLicense() {
    this.showDownloadLicense = false;
  }

  subscriptionAdjusted() {
    this.load();
  }

  adjustStorage(add: boolean) {
    this.adjustStorageAdd = add;
    this.showAdjustStorage = true;
  }

  closeStorage(load: boolean) {
    this.showAdjustStorage = false;
    if (load) {
      this.load();
    }
  }

  removeSponsorship = async () => {
    const isConfirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("removeSponsorshipConfirmation"),
      this.i18nService.t("removeSponsorship"),
      this.i18nService.t("remove"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await this.apiService.deleteRemoveSponsorship(this.organizationId);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removeSponsorshipSuccess")
      );
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  };

  get showChangePlanButton() {
    return this.subscription == null && this.sub.planType === PlanType.Free && !this.showChangePlan;
  }
}
