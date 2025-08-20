// FIXME: Update this file to be type safe and remove this and next line
// @ts-strict-ignore
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, firstValueFrom, takeUntil } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { ManageTaxInformationComponent } from "@bitwarden/angular/billing/components";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import {
  getOrganizationById,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { ProviderApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/provider/provider-api.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { OrganizationCreateRequest } from "@bitwarden/common/admin-console/models/request/organization-create.request";
import { OrganizationKeysRequest } from "@bitwarden/common/admin-console/models/request/organization-keys.request";
import { OrganizationUpgradeRequest } from "@bitwarden/common/admin-console/models/request/organization-upgrade.request";
import { ProviderOrganizationCreateRequest } from "@bitwarden/common/admin-console/models/request/provider/provider-organization-create.request";
import { ProviderResponse } from "@bitwarden/common/admin-console/models/response/provider/provider.response";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { getUserId } from "@bitwarden/common/auth/services/account.service";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions";
import { TaxServiceAbstraction } from "@bitwarden/common/billing/abstractions/tax.service.abstraction";
import {
  PaymentMethodType,
  PlanSponsorshipType,
  PlanType,
  ProductTierType,
} from "@bitwarden/common/billing/enums";
import { TaxInformation } from "@bitwarden/common/billing/models/domain";
import { ExpandedTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/expanded-tax-info-update.request";
import { PreviewOrganizationInvoiceRequest } from "@bitwarden/common/billing/models/request/preview-organization-invoice.request";
import { UpdatePaymentMethodRequest } from "@bitwarden/common/billing/models/request/update-payment-method.request";
import { BillingResponse } from "@bitwarden/common/billing/models/response/billing.response";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/billing/models/response/organization-subscription.response";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { EncryptService } from "@bitwarden/common/key-management/crypto/abstractions/encrypt.service";
import { EncString } from "@bitwarden/common/key-management/crypto/models/enc-string";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { OrganizationId } from "@bitwarden/common/types/guid";
import { OrgKey } from "@bitwarden/common/types/key";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { ToastService } from "@bitwarden/components";
import { KeyService } from "@bitwarden/key-management";

import { OrganizationCreateModule } from "../../admin-console/organizations/create/organization-create.module";
import { BillingSharedModule, secretsManagerSubscribeFormFactory } from "../shared";
import { PaymentComponent } from "../shared/payment/payment.component";

interface OnSuccessArgs {
  organizationId: string;
}

const Allowed2020PlansForLegacyProviders = [
  PlanType.TeamsMonthly2020,
  PlanType.TeamsAnnually2020,
  PlanType.EnterpriseAnnually2020,
  PlanType.EnterpriseMonthly2020,
];

@Component({
  selector: "app-organization-plans",
  templateUrl: "organization-plans.component.html",
  imports: [BillingSharedModule, OrganizationCreateModule],
})
export class OrganizationPlansComponent implements OnInit, OnDestroy {
  @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
  @ViewChild(ManageTaxInformationComponent) taxComponent: ManageTaxInformationComponent;

  @Input() organizationId?: string;
  @Input() showFree = true;
  @Input() showCancel = false;
  @Input() acceptingSponsorship = false;
  @Input() planSponsorshipType?: PlanSponsorshipType;
  @Input() currentPlan: PlanResponse;

  selectedFile: File;

  @Input()
  get productTier(): ProductTierType {
    return this._productTier;
  }

  set productTier(product: ProductTierType) {
    this._productTier = product;
    this.formGroup?.controls?.productTier?.setValue(product);
  }

  private _productTier = ProductTierType.Free;

  protected taxInformation: TaxInformation;

  @Input()
  get plan(): PlanType {
    return this._plan;
  }

  set plan(plan: PlanType) {
    this._plan = plan;
    this.formGroup?.controls?.plan?.setValue(plan);
  }
  @Input() enableSecretsManagerByDefault: boolean;

  private _plan = PlanType.Free;
  @Input() providerId?: string;
  @Input() preSelectedProductTier?: ProductTierType;
  @Output() onSuccess = new EventEmitter<OnSuccessArgs>();
  @Output() onCanceled = new EventEmitter<void>();
  @Output() onTrialBillingSuccess = new EventEmitter();

  loading = true;
  selfHosted = false;
  productTypes = ProductTierType;
  formPromise: Promise<string>;
  singleOrgPolicyAppliesToActiveUser = false;
  isInTrialFlow = false;
  discount = 0;

  secretsManagerSubscription = secretsManagerSubscribeFormFactory(this.formBuilder);

  selfHostedForm = this.formBuilder.group({
    file: [null, [Validators.required]],
  });

  formGroup = this.formBuilder.group({
    name: [""],
    billingEmail: ["", [Validators.email]],
    businessOwned: [false],
    premiumAccessAddon: [false],
    additionalStorage: [0, [Validators.min(0), Validators.max(99)]],
    additionalSeats: [0, [Validators.min(0), Validators.max(100000)]],
    clientOwnerEmail: ["", [Validators.email]],
    plan: [this.plan],
    productTier: [this.productTier],
    secretsManager: this.secretsManagerSubscription,
  });

  passwordManagerPlans: PlanResponse[];
  secretsManagerPlans: PlanResponse[];
  organization: Organization;
  sub: OrganizationSubscriptionResponse;
  billing: BillingResponse;
  provider: ProviderResponse;

  protected estimatedTax: number = 0;
  protected total: number = 0;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private keyService: KeyService,
    private encryptService: EncryptService,
    private router: Router,
    private syncService: SyncService,
    private policyService: PolicyService,
    private organizationService: OrganizationService,
    private messagingService: MessagingService,
    private formBuilder: FormBuilder,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private providerApiService: ProviderApiServiceAbstraction,
    private toastService: ToastService,
    private configService: ConfigService,
    private billingApiService: BillingApiServiceAbstraction,
    private taxService: TaxServiceAbstraction,
    private accountService: AccountService,
  ) {
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    if (this.organizationId) {
      const userId = await firstValueFrom(
        this.accountService.activeAccount$.pipe(map((a) => a?.id)),
      );
      this.organization = await firstValueFrom(
        this.organizationService
          .organizations$(userId)
          .pipe(getOrganizationById(this.organizationId)),
      );
      this.billing = null; // no billing in Vaultwarden
      this.sub = null; // no subscriptions in Vaultwarden;
      this.taxInformation = null; // no taxes in Vaultwarden;
    }

    /* no need to ask /api/plans because Vaultwarden only supports the free plan
    if (!this.selfHosted) {
      const plans = await this.apiService.getPlans();
      this.passwordManagerPlans = plans.data.filter((plan) => !!plan.PasswordManager);
      this.secretsManagerPlans = plans.data.filter((plan) => !!plan.SecretsManager);

      if (
        this.productTier === ProductTierType.Enterprise ||
        this.productTier === ProductTierType.Teams
      ) {
        this.formGroup.controls.businessOwned.setValue(true);
      }
    }

    if (this.currentPlan && this.currentPlan.productTier !== ProductTierType.Enterprise) {
      const upgradedPlan = this.passwordManagerPlans.find((plan) =>
        this.currentPlan.productTier === ProductTierType.Free
          ? plan.type === PlanType.FamiliesAnnually
          : plan.upgradeSortOrder == this.currentPlan.upgradeSortOrder + 1,
      );

      this.plan = upgradedPlan.type;
      this.productTier = upgradedPlan.productTier;
    }

    if (this.hasProvider) {
      this.formGroup.controls.businessOwned.setValue(true);
      this.formGroup.controls.clientOwnerEmail.addValidators(Validators.required);
      this.changedOwnedBusiness();
      this.provider = await this.providerApiService.getProvider(this.providerId);
      const providerDefaultPlan = this.passwordManagerPlans.find(
        (plan) => plan.type === PlanType.TeamsAnnually,
      );
      this.plan = providerDefaultPlan.type;
      this.productTier = providerDefaultPlan.productTier;
    }
    end of asking /api/plans in Vaultwarden */

    if (!this.createOrganization) {
      this.upgradeFlowPrefillForm();
    } else {
      this.formGroup.controls.name.addValidators([Validators.required, Validators.maxLength(50)]);
      this.formGroup.controls.billingEmail.addValidators(Validators.required);
    }

    this.accountService.activeAccount$
      .pipe(
        getUserId,
        switchMap((userId) =>
          this.policyService.policyAppliesToUser$(PolicyType.SingleOrg, userId),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((policyAppliesToActiveUser) => {
        this.singleOrgPolicyAppliesToActiveUser = policyAppliesToActiveUser;
      });

    if (this.preSelectedProductTier != null && this.productTier < this.preSelectedProductTier) {
      this.productTier = this.preSelectedProductTier;
    }
    if (!this.selfHosted) {
      this.changedProduct();
    }

    this.loading = false;

    /* no sales tax in vaultwarden
    this.formGroup.valueChanges.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe(() => {
      this.refreshSalesTax();
    });

    this.secretsManagerForm.valueChanges
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshSalesTax();
      });

    if (this.enableSecretsManagerByDefault && this.selectedSecretsManagerPlan) {
      this.secretsManagerSubscription.patchValue({
        enabled: true,
        userSeats: 1,
        additionalServiceAccounts: 0,
      });
    }
    end of sales tax */
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get singleOrgPolicyBlock() {
    return this.singleOrgPolicyAppliesToActiveUser && !this.hasProvider;
  }

  get createOrganization() {
    return this.organizationId == null;
  }

  get upgradeRequiresPaymentMethod() {
    return false; // Vaultwarden is always free
    return (
      this.organization?.productTierType === ProductTierType.Free &&
      !this.showFree &&
      !this.billing?.paymentSource
    );
  }

  get selectedPlan() {
    return this.passwordManagerPlans.find(
      (plan) => plan.type === this.formGroup.controls.plan.value,
    );
  }

  get selectedSecretsManagerPlan() {
    return this.secretsManagerPlans.find(
      (plan) => plan.type === this.formGroup.controls.plan.value,
    );
  }

  get selectedPlanInterval() {
    return this.selectedPlan.isAnnual ? "year" : "month";
  }

  isProviderQualifiedFor2020Plan() {
    const targetDate = new Date("2023-11-06");

    if (!this.provider || !this.provider.creationDate) {
      return false;
    }

    const creationDate = new Date(this.provider.creationDate);
    return creationDate < targetDate;
  }

  get selectableProducts() {
    return null; // there are no products to select in Vaultwarden
    if (this.acceptingSponsorship) {
      const familyPlan = this.passwordManagerPlans.find(
        (plan) => plan.type === PlanType.FamiliesAnnually,
      );
      this.discount = familyPlan.PasswordManager.basePrice;
      return [familyPlan];
    }

    const businessOwnedIsChecked = this.formGroup.controls.businessOwned.value;

    const result = this.passwordManagerPlans.filter(
      (plan) =>
        plan.type !== PlanType.Custom &&
        (!businessOwnedIsChecked || plan.canBeUsedByBusiness) &&
        (this.showFree || plan.productTier !== ProductTierType.Free) &&
        (plan.isAnnual ||
          plan.productTier === ProductTierType.Free ||
          plan.productTier === ProductTierType.TeamsStarter) &&
        (!this.currentPlan || this.currentPlan.upgradeSortOrder < plan.upgradeSortOrder) &&
        (!this.hasProvider || plan.productTier !== ProductTierType.TeamsStarter) &&
        ((!this.isProviderQualifiedFor2020Plan() && this.planIsEnabled(plan)) ||
          (this.isProviderQualifiedFor2020Plan() &&
            Allowed2020PlansForLegacyProviders.includes(plan.type))),
    );

    result.sort((planA, planB) => planA.displaySortOrder - planB.displaySortOrder);

    return result;
  }

  get selectablePlans() {
    return null; // no plans to select in Vaultwarden
    const selectedProductTierType = this.formGroup.controls.productTier.value;
    const result =
      this.passwordManagerPlans?.filter(
        (plan) =>
          plan.productTier === selectedProductTierType &&
          ((!this.isProviderQualifiedFor2020Plan() && this.planIsEnabled(plan)) ||
            (this.isProviderQualifiedFor2020Plan() &&
              Allowed2020PlansForLegacyProviders.includes(plan.type))),
      ) || [];

    result.sort((planA, planB) => planA.displaySortOrder - planB.displaySortOrder);
    return result;
  }

  get hasProvider() {
    return this.providerId != null;
  }

  additionalStoragePriceMonthly(selectedPlan: PlanResponse) {
    if (!selectedPlan.isAnnual) {
      return selectedPlan.PasswordManager.additionalStoragePricePerGb;
    }
    return selectedPlan.PasswordManager.additionalStoragePricePerGb / 12;
  }

  seatPriceMonthly(selectedPlan: PlanResponse) {
    if (!selectedPlan.isAnnual) {
      return selectedPlan.PasswordManager.seatPrice;
    }
    return selectedPlan.PasswordManager.seatPrice / 12;
  }

  additionalStorageTotal(plan: PlanResponse): number {
    if (!plan.PasswordManager.hasAdditionalStorageOption) {
      return 0;
    }

    return (
      plan.PasswordManager.additionalStoragePricePerGb *
      Math.abs(this.formGroup.controls.additionalStorage.value || 0)
    );
  }

  passwordManagerSeatTotal(plan: PlanResponse, seats: number): number {
    if (!plan.PasswordManager.hasAdditionalSeatsOption) {
      return 0;
    }

    return plan.PasswordManager.seatPrice * Math.abs(seats || 0);
  }

  secretsManagerSeatTotal(plan: PlanResponse, seats: number): number {
    if (!plan.SecretsManager.hasAdditionalSeatsOption) {
      return 0;
    }

    return plan.SecretsManager.seatPrice * Math.abs(seats || 0);
  }

  additionalServiceAccountTotal(plan: PlanResponse): number {
    if (!plan.SecretsManager.hasAdditionalServiceAccountOption) {
      return 0;
    }

    return (
      plan.SecretsManager.additionalPricePerServiceAccount *
      Math.abs(this.secretsManagerForm.value.additionalServiceAccounts || 0)
    );
  }

  get passwordManagerSubtotal() {
    let subTotal = this.selectedPlan.PasswordManager.basePrice;
    if (
      this.selectedPlan.PasswordManager.hasAdditionalSeatsOption &&
      this.formGroup.controls.additionalSeats.value
    ) {
      subTotal += this.passwordManagerSeatTotal(
        this.selectedPlan,
        this.formGroup.value.additionalSeats,
      );
    }
    if (
      this.selectedPlan.PasswordManager.hasAdditionalStorageOption &&
      this.formGroup.controls.additionalStorage.value
    ) {
      subTotal += this.additionalStorageTotal(this.selectedPlan);
    }
    if (
      this.selectedPlan.PasswordManager.hasPremiumAccessOption &&
      this.formGroup.controls.premiumAccessAddon.value
    ) {
      subTotal += this.selectedPlan.PasswordManager.premiumAccessOptionPrice;
    }
    return subTotal - this.discount;
  }

  get secretsManagerSubtotal() {
    const plan = this.selectedSecretsManagerPlan;
    const formValues = this.secretsManagerForm.value;

    if (!this.planOffersSecretsManager || !formValues.enabled) {
      return 0;
    }

    return (
      plan.SecretsManager.basePrice +
      this.secretsManagerSeatTotal(plan, formValues.userSeats) +
      this.additionalServiceAccountTotal(plan)
    );
  }

  get freeTrial() {
    return this.selectedPlan.trialPeriodDays != null;
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

  get secretsManagerForm() {
    return this.formGroup.controls.secretsManager;
  }

  get planOffersSecretsManager() {
    return false; // no support for secrets manager in Vaultwarden
    return this.selectedSecretsManagerPlan != null;
  }

  get teamsStarterPlanIsAvailable() {
    return this.selectablePlans.some((plan) => plan.type === PlanType.TeamsStarter);
  }

  changedProduct() {
    return; // no choice of products in Vaultwarden
    const selectedPlan = this.selectablePlans[0];

    this.setPlanType(selectedPlan.type);
    this.handlePremiumAddonAccess(selectedPlan.PasswordManager.hasPremiumAccessOption);
    this.handleAdditionalStorage(selectedPlan.PasswordManager.hasAdditionalStorageOption);
    this.handleAdditionalSeats(selectedPlan.PasswordManager.hasAdditionalSeatsOption);
    this.handleSecretsManagerForm();
  }

  setPlanType(planType: PlanType) {
    this.formGroup.controls.plan.setValue(planType);
  }

  handlePremiumAddonAccess(hasPremiumAccessOption: boolean) {
    this.formGroup.controls.premiumAccessAddon.setValue(!hasPremiumAccessOption);
  }

  handleAdditionalStorage(selectedPlanHasAdditionalStorageOption: boolean) {
    if (!selectedPlanHasAdditionalStorageOption || !this.currentPlan) {
      this.formGroup.controls.additionalStorage.setValue(0);
      return;
    }

    if (this.organization?.maxStorageGb) {
      this.formGroup.controls.additionalStorage.setValue(
        this.organization.maxStorageGb - this.currentPlan.PasswordManager.baseStorageGb,
      );
    }
  }

  handleAdditionalSeats(selectedPlanHasAdditionalSeatsOption: boolean) {
    if (!selectedPlanHasAdditionalSeatsOption) {
      this.formGroup.controls.additionalSeats.setValue(0);
      return;
    }

    if (this.currentPlan && !this.currentPlan.PasswordManager.hasAdditionalSeatsOption) {
      this.formGroup.controls.additionalSeats.setValue(this.currentPlan.PasswordManager.baseSeats);
      return;
    }

    if (this.organization) {
      this.formGroup.controls.additionalSeats.setValue(this.organization.seats);
      return;
    }

    this.formGroup.controls.additionalSeats.setValue(1);
  }

  handleSecretsManagerForm() {
    if (this.planOffersSecretsManager) {
      this.secretsManagerForm.enable();
    }

    if (this.organization?.useSecretsManager) {
      this.secretsManagerForm.controls.enabled.setValue(true);
    }

    if (this.secretsManagerForm.controls.enabled.value) {
      this.secretsManagerForm.controls.userSeats.setValue(this.sub?.smSeats || 1);
      this.secretsManagerForm.controls.additionalServiceAccounts.setValue(
        this.sub?.smServiceAccounts - this.currentPlan.SecretsManager?.baseServiceAccount || 0,
      );
    }

    this.secretsManagerForm.updateValueAndValidity();
  }

  changedOwnedBusiness() {
    if (!this.formGroup.controls.businessOwned.value || this.selectedPlan.canBeUsedByBusiness) {
      return;
    }
    if (this.teamsStarterPlanIsAvailable) {
      this.formGroup.controls.productTier.setValue(ProductTierType.TeamsStarter);
      this.formGroup.controls.plan.setValue(PlanType.TeamsStarter);
    } else {
      this.formGroup.controls.productTier.setValue(ProductTierType.Teams);
      this.formGroup.controls.plan.setValue(PlanType.TeamsAnnually);
    }
    this.changedProduct();
  }

  protected changedCountry(): void {
    this.paymentComponent.showBankAccount = this.taxInformation?.country === "US";
    if (
      !this.paymentComponent.showBankAccount &&
      this.paymentComponent.selected === PaymentMethodType.BankAccount
    ) {
      this.paymentComponent.select(PaymentMethodType.Card);
    }
  }

  protected onTaxInformationChanged(event: TaxInformation): void {
    this.taxInformation = event;
    this.changedCountry();
    this.refreshSalesTax();
  }

  protected cancel(): void {
    this.onCanceled.emit();
  }

  protected setSelectedFile(event: Event): void {
    const fileInputEl = <HTMLInputElement>event.target;
    this.selectedFile = fileInputEl.files.length > 0 ? fileInputEl.files[0] : null;
  }

  submit = async () => {
    if (this.taxComponent && !this.taxComponent.validate()) {
      this.taxComponent.markAllAsTouched();
      return;
    }

    if (this.singleOrgPolicyBlock) {
      return;
    }
    const doSubmit = async (): Promise<string> => {
      let orgId: string;
      if (this.createOrganization) {
        const orgKey = await this.keyService.makeOrgKey<OrgKey>();
        const key = orgKey[0].encryptedString;
        const collection = await this.encryptService.encryptString(
          this.i18nService.t("defaultCollection"),
          orgKey[1],
        );
        const collectionCt = collection.encryptedString;
        const orgKeys = await this.keyService.makeKeyPair(orgKey[1]);

        // always use createCloudHosted() to disable license file upload
        orgId = await this.createCloudHosted(key, collectionCt, orgKeys, orgKey[1]);

        this.toastService.showToast({
          variant: "success",
          title: this.i18nService.t("organizationCreated"),
          message: this.i18nService.t("organizationReadyToGo"),
        });
      } else {
        orgId = await this.updateOrganization();
        this.toastService.showToast({
          variant: "success",
          title: null,
          message: this.i18nService.t("organizationUpgraded"),
        });
      }

      await this.apiService.refreshIdentityToken();
      await this.syncService.fullSync(true);

      if (!this.acceptingSponsorship && !this.isInTrialFlow) {
        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
    // TODO: No one actually listening to this message?
    this.messagingService.send("organizationCreated", { organizationId });
  };

  protected get showTaxIdField(): boolean {
    switch (this.formGroup.controls.productTier.value) {
      case ProductTierType.Free:
      case ProductTierType.Families:
        return false;
      default:
        return true;
    }
  }

  private refreshSalesTax(): void {
    if (!this.taxComponent.validate()) {
      return;
    }

    const request: PreviewOrganizationInvoiceRequest = {
      organizationId: this.organizationId,
      passwordManager: {
        additionalStorage: this.formGroup.controls.additionalStorage.value,
        plan: this.formGroup.controls.plan.value,
        sponsoredPlan: this.planSponsorshipType,
        seats: this.formGroup.controls.additionalSeats.value,
      },
      taxInformation: {
        postalCode: this.taxInformation.postalCode,
        country: this.taxInformation.country,
        taxId: this.taxInformation.taxId,
      },
    };

    if (this.secretsManagerForm.controls.enabled.value === true) {
      request.secretsManager = {
        seats: this.secretsManagerForm.controls.userSeats.value,
        additionalMachineAccounts: this.secretsManagerForm.controls.additionalServiceAccounts.value,
      };
    }

    this.taxService
      .previewOrganizationInvoice(request)
      .then((invoice) => {
        this.estimatedTax = invoice.taxAmount;
        this.total = invoice.totalAmount;
      })
      .catch((error) => {
        this.toastService.showToast({
          title: "",
          variant: "error",
          message: this.i18nService.t(error.message),
        });
      });
  }

  private async updateOrganization() {
    const request = new OrganizationUpgradeRequest();
    request.additionalSeats = this.formGroup.controls.additionalSeats.value;
    request.additionalStorageGb = this.formGroup.controls.additionalStorage.value;
    request.premiumAccessAddon =
      this.selectedPlan.PasswordManager.hasPremiumAccessOption &&
      this.formGroup.controls.premiumAccessAddon.value;
    request.planType = this.selectedPlan.type;
    request.billingAddressCountry = this.taxInformation?.country;
    request.billingAddressPostalCode = this.taxInformation?.postalCode;

    // Secrets Manager
    this.buildSecretsManagerRequest(request);

    if (this.upgradeRequiresPaymentMethod) {
      const updatePaymentMethodRequest = new UpdatePaymentMethodRequest();
      updatePaymentMethodRequest.paymentSource = await this.paymentComponent.tokenize();
      updatePaymentMethodRequest.taxInformation = ExpandedTaxInfoUpdateRequest.From(
        this.taxInformation,
      );
      await this.billingApiService.updateOrganizationPaymentMethod(
        this.organizationId,
        updatePaymentMethodRequest,
      );
    }

    // Backfill pub/priv key if necessary
    if (!this.organization.hasPublicAndPrivateKeys) {
      const userId = await firstValueFrom(
        this.accountService.activeAccount$.pipe(map((a) => a?.id)),
      );
      const orgShareKey = await firstValueFrom(
        this.keyService
          .orgKeys$(userId)
          .pipe(map((orgKeys) => orgKeys?.[this.organizationId as OrganizationId] ?? null)),
      );
      const orgKeys = await this.keyService.makeKeyPair(orgShareKey);
      request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
    }

    await this.organizationApiService.upgrade(this.organizationId, request);
    return this.organizationId;
  }

  private async createCloudHosted(
    key: string,
    collectionCt: string,
    orgKeys: [string, EncString],
    orgKey: SymmetricCryptoKey,
  ): Promise<string> {
    const request = new OrganizationCreateRequest();
    request.key = key;
    request.collectionName = collectionCt;
    request.name = this.formGroup.controls.name.value;
    request.billingEmail = this.formGroup.controls.billingEmail.value;
    request.initiationPath = "New organization creation in-product";
    request.keys = new OrganizationKeysRequest(orgKeys[0], orgKeys[1].encryptedString);
    request.planType = PlanType.Free; // always select the free plan in Vaultwarden

    /* there is no plan to select in Vaultwarden
    if (this.selectedPlan.type === PlanType.Free) {
      request.planType = PlanType.Free;
    } else {
      const { type, token } = await this.paymentComponent.tokenize();

      request.paymentToken = token;
      request.paymentMethodType = type;
      request.additionalSeats = this.formGroup.controls.additionalSeats.value;
      request.additionalStorageGb = this.formGroup.controls.additionalStorage.value;
      request.premiumAccessAddon =
        this.selectedPlan.PasswordManager.hasPremiumAccessOption &&
        this.formGroup.controls.premiumAccessAddon.value;
      request.planType = this.selectedPlan.type;
      request.billingAddressPostalCode = this.taxInformation?.postalCode;
      request.billingAddressCountry = this.taxInformation?.country;
      request.taxIdNumber = this.taxInformation?.taxId;
      request.billingAddressLine1 = this.taxInformation?.line1;
      request.billingAddressLine2 = this.taxInformation?.line2;
      request.billingAddressCity = this.taxInformation?.city;
      request.billingAddressState = this.taxInformation?.state;
    }

    // Secrets Manager
    this.buildSecretsManagerRequest(request);
    end plan selection and no support for secret manager in Vaultwarden */

    if (this.hasProvider) {
      const providerRequest = new ProviderOrganizationCreateRequest(
        this.formGroup.controls.clientOwnerEmail.value,
        request,
      );
      const providerKey = await this.keyService.getProviderKey(this.providerId);
      providerRequest.organizationCreateRequest.key = (
        await this.encryptService.wrapSymmetricKey(orgKey, providerKey)
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
    if (!this.selectedFile) {
      throw new Error(this.i18nService.t("selectFile"));
    }

    const fd = new FormData();
    fd.append("license", this.selectedFile);
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
    const price =
      selectedPlan.PasswordManager.basePrice === 0
        ? selectedPlan.PasswordManager.seatPrice
        : selectedPlan.PasswordManager.basePrice;
    let text = "";

    if (selectedPlan.isAnnual) {
      text += `${this.i18nService.t("annual")} ($${price}/${this.i18nService.t("yr")})`;
    } else {
      text += `${this.i18nService.t("monthly")} ($${price}/${this.i18nService.t("monthAbbr")})`;
    }

    return text;
  }

  private buildSecretsManagerRequest(
    request: OrganizationCreateRequest | OrganizationUpgradeRequest,
  ): void {
    return; // Vaultwarden does not support SecretsManager
    const formValues = this.secretsManagerForm.value;

    request.useSecretsManager = this.planOffersSecretsManager && formValues.enabled;

    if (!request.useSecretsManager) {
      return;
    }

    if (this.selectedSecretsManagerPlan.SecretsManager.hasAdditionalSeatsOption) {
      request.additionalSmSeats = formValues.userSeats;
    }

    if (this.selectedSecretsManagerPlan.SecretsManager.hasAdditionalServiceAccountOption) {
      request.additionalServiceAccounts = formValues.additionalServiceAccounts;
    }
  }

  private upgradeFlowPrefillForm() {
    return; // Vaultwarden only supports free plan
    if (this.acceptingSponsorship) {
      this.formGroup.controls.productTier.setValue(ProductTierType.Families);
      this.changedProduct();
      return;
    }

    if (this.currentPlan && this.currentPlan.productTier !== ProductTierType.Enterprise) {
      const upgradedPlan = this.passwordManagerPlans.find((plan) => {
        if (this.currentPlan.productTier === ProductTierType.Free) {
          return plan.type === PlanType.FamiliesAnnually;
        }

        if (
          this.currentPlan.productTier === ProductTierType.Families &&
          !this.teamsStarterPlanIsAvailable
        ) {
          return plan.type === PlanType.TeamsAnnually;
        }

        return plan.upgradeSortOrder === this.currentPlan.upgradeSortOrder + 1;
      });

      this.plan = upgradedPlan.type;
      this.productTier = upgradedPlan.productTier;
      this.changedProduct();
    }
  }

  private planIsEnabled(plan: PlanResponse) {
    return !plan.disabled && !plan.legacyYear;
  }

  protected async onLicenseFileUploaded(organizationId: string): Promise<void> {
    this.toastService.showToast({
      variant: "success",
      title: this.i18nService.t("organizationCreated"),
      message: this.i18nService.t("organizationReadyToGo"),
    });

    if (!this.acceptingSponsorship && !this.isInTrialFlow) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/organizations/" + organizationId]);
    }

    if (this.isInTrialFlow) {
      this.onTrialBillingSuccess.emit({
        orgId: organizationId,
        subLabelText: this.billingSubLabelText(),
      });
    }

    this.onSuccess.emit({ organizationId: organizationId });

    // TODO: No one actually listening to this message?
    this.messagingService.send("organizationCreated", { organizationId: organizationId });
  }
}
