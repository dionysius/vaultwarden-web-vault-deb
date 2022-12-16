import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationApiKeyType } from "@bitwarden/common/enums/organizationApiKeyType";
import { OrganizationConnectionType } from "@bitwarden/common/enums/organizationConnectionType";
import { PlanType } from "@bitwarden/common/enums/planType";
import { BillingSyncConfigApi } from "@bitwarden/common/models/api/billing-sync-config.api";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationConnectionResponse } from "@bitwarden/common/models/response/organization-connection.response";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/models/response/organization-subscription.response";

import { BillingSyncKeyComponent } from "../../settings/billing-sync-key.component";

import { BillingSyncApiKeyComponent } from "./billing-sync-api-key.component";
import { SubscriptionHiddenIcon } from "./subscription-hidden.icon";

@Component({
  selector: "app-org-subscription",
  templateUrl: "organization-subscription.component.html",
})
export class OrganizationSubscriptionComponent implements OnInit, OnDestroy {
  @ViewChild("setupBillingSyncTemplate", { read: ViewContainerRef, static: true })
  setupBillingSyncModalRef: ViewContainerRef;

  loading = false;
  firstLoaded = false;
  organizationId: string;
  adjustStorageAdd = true;
  showAdjustStorage = false;
  showUpdateLicense = false;
  showBillingSyncKey = false;
  showDownloadLicense = false;
  showChangePlan = false;
  sub: OrganizationSubscriptionResponse;
  selfHosted = false;
  hasBillingSyncToken: boolean;

  userOrg: Organization;
  existingBillingSyncConnection: OrganizationConnectionResponse<BillingSyncConfigApi>;

  removeSponsorshipPromise: Promise<void>;
  cancelPromise: Promise<void>;
  reinstatePromise: Promise<void>;

  @ViewChild("rotateBillingSyncKeyTemplate", { read: ViewContainerRef, static: true })
  billingSyncKeyViewContainerRef: ViewContainerRef;
  billingSyncKeyRef: [ModalRef, BillingSyncKeyComponent];

  subscriptionHiddenIcon = SubscriptionHiddenIcon;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private logService: LogService,
    private modalService: ModalService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {
    this.selfHosted = platformUtilsService.isSelfHost();
  }

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

    if (this.selfHosted) {
      this.showBillingSyncKey = await this.apiService.getCloudCommunicationsEnabled();
    }

    if (this.showBillingSyncKey) {
      this.existingBillingSyncConnection = await this.apiService.getOrganizationConnection(
        this.organizationId,
        OrganizationConnectionType.CloudBillingSync,
        BillingSyncConfigApi
      );
    }

    this.loading = false;
  }

  async reinstate() {
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
      this.reinstatePromise = this.organizationApiService.reinstate(this.organizationId);
      await this.reinstatePromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("reinstated"));
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async cancel() {
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
      this.cancelPromise = this.organizationApiService.cancel(this.organizationId);
      await this.cancelPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("canceledSubscription")
      );
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

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
    const [ref] = await this.modalService.openViewRef(
      BillingSyncApiKeyComponent,
      this.setupBillingSyncModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.hasBillingToken = this.hasBillingSyncToken;
      }
    );
    ref.onClosed
      .pipe(
        concatMap(async () => {
          await this.load();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  closeDownloadLicense() {
    this.showDownloadLicense = false;
  }

  updateLicense() {
    if (this.loading) {
      return;
    }
    this.showUpdateLicense = true;
  }

  closeUpdateLicense(updated: boolean) {
    this.showUpdateLicense = false;
    if (updated) {
      this.load();
      this.messagingService.send("updatedOrgLicense");
    }
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

  async removeSponsorship() {
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
      this.removeSponsorshipPromise = this.apiService.deleteRemoveSponsorship(this.organizationId);
      await this.removeSponsorshipPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removeSponsorshipSuccess")
      );
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async manageBillingSyncSelfHosted() {
    this.billingSyncKeyRef = await this.modalService.openViewRef(
      BillingSyncKeyComponent,
      this.billingSyncKeyViewContainerRef,
      (comp) => {
        comp.entityId = this.organizationId;
        comp.existingConnectionId = this.existingBillingSyncConnection?.id;
        comp.billingSyncKey = this.existingBillingSyncConnection?.config?.billingSyncKey;
        comp.setParentConnection = (
          connection: OrganizationConnectionResponse<BillingSyncConfigApi>
        ) => {
          this.existingBillingSyncConnection = connection;
          this.billingSyncKeyRef[0].close();
        };
      }
    );
  }

  get isExpired() {
    return (
      this.sub != null && this.sub.expiration != null && new Date(this.sub.expiration) < new Date()
    );
  }

  get subscriptionMarkedForCancel() {
    return (
      this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate
    );
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
      !this.selfHosted &&
      (this.sub.planType === PlanType.EnterpriseAnnually ||
        this.sub.planType === PlanType.EnterpriseMonthly ||
        this.sub.planType === PlanType.EnterpriseAnnually2019 ||
        this.sub.planType === PlanType.EnterpriseMonthly2019)
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

  get showChangePlanButton() {
    return this.subscription == null && this.sub.planType === PlanType.Free && !this.showChangePlan;
  }

  get billingSyncSetUp() {
    return this.existingBillingSyncConnection?.id != null;
  }
}
