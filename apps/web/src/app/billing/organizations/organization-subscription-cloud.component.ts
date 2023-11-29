import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, firstValueFrom, Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationApiKeyType } from "@bitwarden/common/admin-console/enums";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { PlanType } from "@bitwarden/common/billing/enums";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/billing/models/response/organization-subscription.response";
import { BillingSubscriptionItemResponse } from "@bitwarden/common/billing/models/response/subscription.response";
import { ProductType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DialogService } from "@bitwarden/components";

import { BillingSyncApiKeyComponent } from "./billing-sync-api-key.component";
import { SecretsManagerSubscriptionOptions } from "./sm-adjust-subscription.component";

@Component({
  templateUrl: "organization-subscription-cloud.component.html",
})
export class OrganizationSubscriptionCloudComponent implements OnInit, OnDestroy {
  sub: OrganizationSubscriptionResponse;
  lineItems: BillingSubscriptionItemResponse[] = [];
  organizationId: string;
  userOrg: Organization;
  showChangePlan = false;
  showDownloadLicense = false;
  adjustStorageAdd = true;
  showAdjustStorage = false;
  hasBillingSyncToken: boolean;
  showAdjustSecretsManager = false;

  showSecretsManagerSubscribe = false;

  firstLoaded = false;
  loading: boolean;

  private readonly _smBetaEndingDate = new Date(2023, 7, 15);
  private readonly _smGracePeriodEndingDate = new Date(2023, 10, 14);

  protected readonly teamsStarter = ProductType.TeamsStarter;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private datePipe: DatePipe,
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
        takeUntil(this.destroy$),
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
    if (this.userOrg.canViewSubscription) {
      this.sub = await this.organizationApiService.getSubscription(this.organizationId);
      this.lineItems = this.sub?.subscription?.items;
      if (this.lineItems && this.lineItems.length) {
        this.lineItems = this.lineItems
          .map((item) => {
            const itemTotalAmount = item.amount * item.quantity;
            const seatPriceTotal = this.sub.plan?.SecretsManager?.seatPrice * item.quantity;
            item.productName =
              itemTotalAmount === seatPriceTotal || item.name.includes("Service Accounts")
                ? "secretsManager"
                : "passwordManager";
            return item;
          })
          .sort(sortSubscriptionItems);
      }
    }

    const apiKeyResponse = await this.organizationApiService.getApiKeyInformation(
      this.organizationId,
    );
    this.hasBillingSyncToken = apiKeyResponse.data.some(
      (i) => i.keyType === OrganizationApiKeyType.BillingSync,
    );

    this.showSecretsManagerSubscribe =
      this.userOrg.canEditSubscription &&
      !this.userOrg.hasProvider &&
      this.sub?.plan?.SecretsManager &&
      !this.userOrg.useSecretsManager &&
      !this.subscription?.cancelled &&
      !this.subscriptionMarkedForCancel;

    this.showAdjustSecretsManager =
      this.userOrg.canEditSubscription &&
      this.userOrg.useSecretsManager &&
      this.subscription != null &&
      this.sub.plan?.SecretsManager?.hasAdditionalSeatsOption &&
      !this.sub.secretsManagerBeta &&
      !this.subscription.cancelled &&
      !this.subscriptionMarkedForCancel;

    this.loading = false;
  }

  get subscription() {
    return this.sub != null ? this.sub.subscription : null;
  }

  get subscriptionLineItems() {
    return this.lineItems.map((lineItem: BillingSubscriptionItemResponse) => ({
      name: lineItem.name,
      amount: this.discountPrice(lineItem.amount),
      quantity: lineItem.quantity,
      interval: lineItem.interval,
      sponsoredSubscriptionItem: lineItem.sponsoredSubscriptionItem,
      addonSubscriptionItem: lineItem.addonSubscriptionItem,
      productName: lineItem.productName,
    }));
  }

  get nextInvoice() {
    return this.sub != null ? this.sub.upcomingInvoice : null;
  }

  get customerDiscount() {
    return this.sub != null ? this.sub.customerDiscount : null;
  }

  get isExpired() {
    const nextInvoice = this.nextInvoice;

    if (nextInvoice == null) {
      return false;
    }

    return new Date(nextInvoice.date).getTime() < Date.now();
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
    return this.discountPrice(this.sub.plan.PasswordManager.additionalStoragePricePerGb);
  }

  get seatPrice() {
    return this.discountPrice(this.sub.plan.PasswordManager.seatPrice);
  }

  get seats() {
    return this.sub.seats;
  }

  get smOptions(): SecretsManagerSubscriptionOptions {
    return {
      seatCount: this.sub.smSeats,
      maxAutoscaleSeats: this.sub.maxAutoscaleSmSeats,
      seatPrice: this.discountPrice(this.sub.plan.SecretsManager.seatPrice),
      maxAutoscaleServiceAccounts: this.sub.maxAutoscaleSmServiceAccounts,
      additionalServiceAccounts:
        this.sub.smServiceAccounts - this.sub.plan.SecretsManager.baseServiceAccount,
      interval: this.sub.plan.isAnnual ? "year" : "month",
      additionalServiceAccountPrice: this.discountPrice(
        this.sub.plan.SecretsManager.additionalPricePerServiceAccount,
      ),
      baseServiceAccountCount: this.sub.plan.SecretsManager.baseServiceAccount,
    };
  }

  get maxAutoscaleSeats() {
    return this.sub.maxAutoscaleSeats;
  }

  get canAdjustSeats() {
    return this.sub.plan.PasswordManager.hasAdditionalSeatsOption;
  }

  get isAdmin() {
    return this.userOrg.isAdmin;
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
      this.sub.planType === PlanType.EnterpriseAnnually2020 ||
      this.sub.planType === PlanType.EnterpriseMonthly2020 ||
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
    } else if (this.userOrg.planProductType === ProductType.TeamsStarter) {
      return this.i18nService.t("subscriptionUserSeatsWithoutAdditionalSeatsOption", 10);
    } else if (this.sub.maxAutoscaleSeats == null) {
      return this.i18nService.t("subscriptionUserSeatsUnlimitedAutoscale");
    } else {
      return this.i18nService.t(
        "subscriptionUserSeatsLimitedAutoscale",
        this.sub.maxAutoscaleSeats.toString(),
      );
    }
  }

  get subscriptionMarkedForCancel() {
    return (
      this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate
    );
  }

  get smBetaEndedDesc() {
    return this.i18nService.translate(
      "smBetaEndedDesc",
      this.datePipe.transform(this._smBetaEndingDate),
      Utils.daysRemaining(this._smGracePeriodEndingDate).toString(),
    );
  }

  cancel = async () => {
    if (this.loading) {
      return;
    }

    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "cancelSubscription" },
      content: { key: "cancelConfirmation" },
      type: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.organizationApiService.cancel(this.organizationId);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("canceledSubscription"),
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

    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "reinstateSubscription" },
      content: { key: "reinstateConfirmation" },
      type: "warning",
    });

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
    const dialogRef = BillingSyncApiKeyComponent.open(this.dialogService, {
      organizationId: this.organizationId,
      hasBillingToken: this.hasBillingSyncToken,
    });

    await firstValueFrom(dialogRef.closed);
    this.load();
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
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "removeSponsorship" },
      content: { key: "removeSponsorshipConfirmation" },
      acceptButtonText: { key: "remove" },
      type: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.apiService.deleteRemoveSponsorship(this.organizationId);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removeSponsorshipSuccess"),
      );
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  };

  discountPrice = (price: number) => {
    const discount =
      !!this.customerDiscount && this.customerDiscount.active
        ? price * (this.customerDiscount.percentOff / 100)
        : 0;

    return price - discount;
  };

  get showChangePlanButton() {
    return this.subscription == null && this.sub.planType === PlanType.Free && !this.showChangePlan;
  }
}

/**
 * Helper to sort subscription items by product type and then by addon status
 */
function sortSubscriptionItems(
  a: BillingSubscriptionItemResponse,
  b: BillingSubscriptionItemResponse,
) {
  if (a.productName == b.productName) {
    if (a.addonSubscriptionItem == b.addonSubscriptionItem) {
      return 0;
    }
    // sort addon items to the bottom
    if (a.addonSubscriptionItem) {
      return 1;
    }
    return -1;
  }
  return a.productName.localeCompare(b.productName);
}
