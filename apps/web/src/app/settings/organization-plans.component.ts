import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { PaymentMethodType } from "@bitwarden/common/enums/paymentMethodType";
import { PlanType } from "@bitwarden/common/enums/planType";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { ProductType } from "@bitwarden/common/enums/productType";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { OrganizationCreateRequest } from "@bitwarden/common/models/request/organization-create.request";
import { OrganizationKeysRequest } from "@bitwarden/common/models/request/organization-keys.request";
import { OrganizationUpgradeRequest } from "@bitwarden/common/models/request/organization-upgrade.request";
import { ProviderOrganizationCreateRequest } from "@bitwarden/common/models/request/provider/provider-organization-create.request";
import { PlanResponse } from "@bitwarden/common/models/response/plan.response";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { PaymentComponent } from "./payment.component";
import { TaxInfoComponent } from "./tax-info.component";

interface OnSuccessArgs {
  organizationId: string;
}

@Component({
  selector: "app-organization-plans",
  templateUrl: "organization-plans.component.html",
})
export class OrganizationPlansComponent implements OnInit, OnDestroy {
  @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
  @ViewChild(TaxInfoComponent) taxComponent: TaxInfoComponent;

  @Input() organizationId: string;
  @Input() showFree = true;
  @Input() showCancel = false;
  @Input() acceptingSponsorship = false;
  @Input()
  get product(): ProductType {
    return this._product;
  }
  set product(product: ProductType) {
    this._product = product;
    this.formGroup?.controls?.product?.setValue(product);
  }
  private _product = ProductType.Free;

  @Input()
  get plan(): PlanType {
    return this._plan;
  }
  set plan(plan: PlanType) {
    this._plan = plan;
    this.formGroup?.controls?.plan?.setValue(plan);
  }
  private _plan = PlanType.Free;
  @Input() providerId: string;
  @Output() onSuccess = new EventEmitter<OnSuccessArgs>();
  @Output() onCanceled = new EventEmitter<void>();
  @Output() onTrialBillingSuccess = new EventEmitter();

  loading = true;
  selfHosted = false;
  productTypes = ProductType;
  formPromise: Promise<string>;
  singleOrgPolicyBlock = false;
  isInTrialFlow = false;
  discount = 0;

  formGroup = this.formBuilder.group({
    name: [""],
    billingEmail: ["", [Validators.email]],
    businessOwned: [false],
    premiumAccessAddon: [false],
    additionalStorage: [0, [Validators.min(0), Validators.max(99)]],
    additionalSeats: [0, [Validators.min(0), Validators.max(100000)]],
    clientOwnerEmail: ["", [Validators.email]],
    businessName: [""],
    plan: [this.plan],
    product: [this.product],
  });

  plans: PlanResponse[];

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private router: Router,
    private syncService: SyncService,
    private policyService: PolicyService,
    private organizationService: OrganizationService,
    private logService: LogService,
    private messagingService: MessagingService,
    private formBuilder: UntypedFormBuilder,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {
    this.selfHosted = platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    if (!this.selfHosted) {
      const plans = await this.apiService.getPlans();
      this.plans = plans.data;
      if (this.product === ProductType.Enterprise || this.product === ProductType.Teams) {
        this.formGroup.controls.businessOwned.setValue(true);
      }
    }

    if (this.providerId) {
      this.formGroup.controls.businessOwned.setValue(true);
      this.changedOwnedBusiness();
    }

    if (!this.createOrganization || this.acceptingSponsorship) {
      this.formGroup.controls.product.setValue(ProductType.Families);
      this.changedProduct();
    }

    if (this.createOrganization) {
      this.formGroup.controls.name.addValidators([Validators.required, Validators.maxLength(50)]);
      this.formGroup.controls.billingEmail.addValidators(Validators.required);
    }

    this.policyService
      .policyAppliesToActiveUser$(PolicyType.SingleOrg)
      .pipe(takeUntil(this.destroy$))
      .subscribe((policyAppliesToActiveUser) => {
        this.singleOrgPolicyBlock = policyAppliesToActiveUser;
      });

    this.loading = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get createOrganization() {
    return this.organizationId == null;
  }

  get selectedPlan() {
    return this.plans.find((plan) => plan.type === this.formGroup.controls.plan.value);
  }

  get selectedPlanInterval() {
    return this.selectedPlan.isAnnual ? "year" : "month";
  }

  get selectableProducts() {
    let validPlans = this.plans.filter((plan) => plan.type !== PlanType.Custom);

    if (this.formGroup.controls.businessOwned.value) {
      validPlans = validPlans.filter((plan) => plan.canBeUsedByBusiness);
    }

    if (!this.showFree) {
      validPlans = validPlans.filter((plan) => plan.product !== ProductType.Free);
    }

    validPlans = validPlans.filter(
      (plan) =>
        !plan.legacyYear &&
        !plan.disabled &&
        (plan.isAnnual || plan.product === this.productTypes.Free)
    );

    if (this.acceptingSponsorship) {
      const familyPlan = this.plans.find((plan) => plan.type === PlanType.FamiliesAnnually);
      this.discount = familyPlan.basePrice;
      validPlans = [familyPlan];
    }

    return validPlans;
  }

  get selectablePlans() {
    return this.plans?.filter(
      (plan) =>
        !plan.legacyYear && !plan.disabled && plan.product === this.formGroup.controls.product.value
    );
  }

  additionalStoragePriceMonthly(selectedPlan: PlanResponse) {
    if (!selectedPlan.isAnnual) {
      return selectedPlan.additionalStoragePricePerGb;
    }
    return selectedPlan.additionalStoragePricePerGb / 12;
  }

  seatPriceMonthly(selectedPlan: PlanResponse) {
    if (!selectedPlan.isAnnual) {
      return selectedPlan.seatPrice;
    }
    return selectedPlan.seatPrice / 12;
  }

  additionalStorageTotal(plan: PlanResponse): number {
    if (!plan.hasAdditionalStorageOption) {
      return 0;
    }

    return (
      plan.additionalStoragePricePerGb *
      Math.abs(this.formGroup.controls.additionalStorage.value || 0)
    );
  }

  seatTotal(plan: PlanResponse): number {
    if (!plan.hasAdditionalSeatsOption) {
      return 0;
    }

    return plan.seatPrice * Math.abs(this.formGroup.controls.additionalSeats.value || 0);
  }

  get subtotal() {
    let subTotal = this.selectedPlan.basePrice;
    if (
      this.selectedPlan.hasAdditionalSeatsOption &&
      this.formGroup.controls.additionalSeats.value
    ) {
      subTotal += this.seatTotal(this.selectedPlan);
    }
    if (
      this.selectedPlan.hasAdditionalStorageOption &&
      this.formGroup.controls.additionalStorage.value
    ) {
      subTotal += this.additionalStorageTotal(this.selectedPlan);
    }
    if (
      this.selectedPlan.hasPremiumAccessOption &&
      this.formGroup.controls.premiumAccessAddon.value
    ) {
      subTotal += this.selectedPlan.premiumAccessOptionPrice;
    }
    return subTotal - this.discount;
  }

  get freeTrial() {
    return this.selectedPlan.trialPeriodDays != null;
  }

  get taxCharges() {
    return this.taxComponent != null && this.taxComponent.taxRate != null
      ? (this.taxComponent.taxRate / 100) * this.subtotal
      : 0;
  }

  get total() {
    return this.subtotal + this.taxCharges || 0;
  }

  get paymentDesc() {
    if (this.acceptingSponsorship) {
      return this.i18nService.t("paymentSponsored");
    } else if (this.freeTrial && this.createOrganization) {
      return this.i18nService.t("paymentChargedWithTrial");
    } else {
      return this.i18nService.t("paymentCharged", this.i18nService.t(this.selectedPlanInterval));
    }
  }

  changedProduct() {
    this.formGroup.controls.plan.setValue(this.selectablePlans[0].type);
    if (!this.selectedPlan.hasPremiumAccessOption) {
      this.formGroup.controls.premiumAccessAddon.setValue(false);
    }
    if (!this.selectedPlan.hasAdditionalStorageOption) {
      this.formGroup.controls.additionalStorage.setValue(0);
    }
    if (!this.selectedPlan.hasAdditionalSeatsOption) {
      this.formGroup.controls.additionalSeats.setValue(0);
    } else if (
      !this.formGroup.controls.additionalSeats.value &&
      !this.selectedPlan.baseSeats &&
      this.selectedPlan.hasAdditionalSeatsOption
    ) {
      this.formGroup.controls.additionalSeats.setValue(1);
    }
  }

  changedOwnedBusiness() {
    if (!this.formGroup.controls.businessOwned.value || this.selectedPlan.canBeUsedByBusiness) {
      return;
    }
    this.formGroup.controls.product.setValue(ProductType.Teams);
    this.formGroup.controls.plan.setValue(PlanType.TeamsAnnually);
    this.changedProduct();
  }

  changedCountry() {
    this.paymentComponent.hideBank = this.taxComponent.taxInfo.country !== "US";
    // Bank Account payments are only available for US customers
    if (
      this.paymentComponent.hideBank &&
      this.paymentComponent.method === PaymentMethodType.BankAccount
    ) {
      this.paymentComponent.method = PaymentMethodType.Card;
      this.paymentComponent.changeMethod();
    }
  }

  cancel() {
    this.onCanceled.emit();
  }

  async submit() {
    if (this.singleOrgPolicyBlock) {
      return;
    }

    try {
      const doSubmit = async (): Promise<string> => {
        let orgId: string = null;
        if (this.createOrganization) {
          const shareKey = await this.cryptoService.makeShareKey();
          const key = shareKey[0].encryptedString;
          const collection = await this.cryptoService.encrypt(
            this.i18nService.t("defaultCollection"),
            shareKey[1]
          );
          const collectionCt = collection.encryptedString;
          const orgKeys = await this.cryptoService.makeKeyPair(shareKey[1]);

          if (this.selfHosted) {
            orgId = await this.createSelfHosted(key, collectionCt, orgKeys);
          } else {
            orgId = await this.createCloudHosted(key, collectionCt, orgKeys, shareKey[1]);
          }

          this.platformUtilsService.showToast(
            "success",
            this.i18nService.t("organizationCreated"),
            this.i18nService.t("organizationReadyToGo")
          );
        } else {
          orgId = await this.updateOrganization(orgId);
          this.platformUtilsService.showToast(
            "success",
            null,
            this.i18nService.t("organizationUpgraded")
          );
        }

        await this.apiService.refreshIdentityToken();
        await this.syncService.fullSync(true);

        if (!this.acceptingSponsorship && !this.isInTrialFlow) {
          this.router.navigate(["/organizations/" + orgId]);
        }

        if (this.isInTrialFlow) {
          this.onTrialBillingSuccess.emit({
            orgId: orgId,
            subLabelText: this.billingSubLabelText(),
          });
        }

        return orgId;
      };

      this.formPromise = doSubmit();
      const organizationId = await this.formPromise;
      this.onSuccess.emit({ organizationId: organizationId });
      this.messagingService.send("organizationCreated", organizationId);
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async updateOrganization(orgId: string) {
    const request = new OrganizationUpgradeRequest();
    request.businessName = this.formGroup.controls.businessOwned.value
      ? this.formGroup.controls.businessName.value
      : null;
    request.additionalSeats = this.formGroup.controls.additionalSeats.value;
    request.additionalStorageGb = this.formGroup.controls.additionalStorage.value;
    request.premiumAccessAddon =
      this.selectedPlan.hasPremiumAccessOption && this.formGroup.controls.premiumAccessAddon.value;
    request.planType = this.selectedPlan.type;
    request.billingAddressCountry = this.taxComponent.taxInfo.country;
    request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;

    // Retrieve org info to backfill pub/priv key if necessary
    const org = await this.organizationService.get(this.organizationId);
    if (!org.hasPublicAndPrivateKeys) {
      const orgShareKey = await this.cryptoService.getOrgKey(this.organizationId);
      const orgKeys = await this.cryptoService.makeKeyPair(orgShareKey);
      request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
    }

    const result = await this.organizationApiService.upgrade(this.organizationId, request);
    if (!result.success && result.paymentIntentClientSecret != null) {
      await this.paymentComponent.handleStripeCardPayment(result.paymentIntentClientSecret, null);
    }
    return this.organizationId;
  }

  private async createCloudHosted(
    key: string,
    collectionCt: string,
    orgKeys: [string, EncString],
    orgKey: SymmetricCryptoKey
  ) {
    const request = new OrganizationCreateRequest();
    request.key = key;
    request.collectionName = collectionCt;
    request.name = this.formGroup.controls.name.value;
    request.billingEmail = this.formGroup.controls.billingEmail.value;
    request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);

    if (this.selectedPlan.type === PlanType.Free) {
      request.planType = PlanType.Free;
    } else {
      const tokenResult = await this.paymentComponent.createPaymentToken();

      request.paymentToken = tokenResult[0];
      request.paymentMethodType = tokenResult[1];
      request.businessName = this.formGroup.controls.businessOwned.value
        ? this.formGroup.controls.businessName.value
        : null;
      request.additionalSeats = this.formGroup.controls.additionalSeats.value;
      request.additionalStorageGb = this.formGroup.controls.additionalStorage.value;
      request.premiumAccessAddon =
        this.selectedPlan.hasPremiumAccessOption &&
        this.formGroup.controls.premiumAccessAddon.value;
      request.planType = this.selectedPlan.type;
      request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;
      request.billingAddressCountry = this.taxComponent.taxInfo.country;
      if (this.taxComponent.taxInfo.includeTaxId) {
        request.taxIdNumber = this.taxComponent.taxInfo.taxId;
        request.billingAddressLine1 = this.taxComponent.taxInfo.line1;
        request.billingAddressLine2 = this.taxComponent.taxInfo.line2;
        request.billingAddressCity = this.taxComponent.taxInfo.city;
        request.billingAddressState = this.taxComponent.taxInfo.state;
      }
    }

    if (this.providerId) {
      const providerRequest = new ProviderOrganizationCreateRequest(
        this.formGroup.controls.clientOwnerEmail.value,
        request
      );
      const providerKey = await this.cryptoService.getProviderKey(this.providerId);
      providerRequest.organizationCreateRequest.key = (
        await this.cryptoService.encrypt(orgKey.key, providerKey)
      ).encryptedString;
      const orgId = (
        await this.apiService.postProviderCreateOrganization(this.providerId, providerRequest)
      ).organizationId;

      return orgId;
    } else {
      return (await this.organizationApiService.create(request)).id;
    }
  }

  private async createSelfHosted(key: string, collectionCt: string, orgKeys: [string, EncString]) {
    const fileEl = document.getElementById("file") as HTMLInputElement;
    const files = fileEl.files;
    if (files == null || files.length === 0) {
      throw new Error(this.i18nService.t("selectFile"));
    }

    const fd = new FormData();
    fd.append("license", files[0]);
    fd.append("key", key);
    fd.append("collectionName", collectionCt);
    const response = await this.organizationApiService.createLicense(fd);
    const orgId = response.id;

    await this.apiService.refreshIdentityToken();

    // Org Keys live outside of the OrganizationLicense - add the keys to the org here
    const request = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
    await this.organizationApiService.updateKeys(orgId, request);

    return orgId;
  }

  private billingSubLabelText(): string {
    const selectedPlan = this.selectedPlan;
    const price = selectedPlan.basePrice === 0 ? selectedPlan.seatPrice : selectedPlan.basePrice;
    let text = "";

    if (selectedPlan.isAnnual) {
      text += `${this.i18nService.t("annual")} ($${price}/${this.i18nService.t("yr")})`;
    } else {
      text += `${this.i18nService.t("monthly")} ($${price}/${this.i18nService.t("monthAbbr")})`;
    }

    return text;
  }
}
