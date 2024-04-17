import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { first } from "rxjs/operators";

import { ProviderApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/provider/provider-api.service.abstraction";
import { ProviderSetupRequest } from "@bitwarden/common/admin-console/models/request/provider/provider-setup.request";
import { ExpandedTaxInfoUpdateRequest } from "@bitwarden/common/billing/models/request/expanded-tax-info-update.request";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { ProviderKey } from "@bitwarden/common/types/key";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { TaxInfoComponent } from "@bitwarden/web-vault/app/billing";

@Component({
  selector: "provider-setup",
  templateUrl: "setup.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class SetupComponent implements OnInit {
  @ViewChild(TaxInfoComponent) taxInfoComponent: TaxInfoComponent;

  loading = true;
  authed = false;
  email: string;
  formPromise: Promise<any>;

  providerId: string;
  token: string;
  name: string;
  billingEmail: string;

  protected showPaymentMethodWarningBanners$ = this.configService.getFeatureFlag$(
    FeatureFlag.ShowPaymentMethodWarningBanners,
    false,
  );

  protected enableConsolidatedBilling$ = this.configService.getFeatureFlag$(
    FeatureFlag.EnableConsolidatedBilling,
    false,
  );

  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private cryptoService: CryptoService,
    private syncService: SyncService,
    private validationService: ValidationService,
    private configService: ConfigService,
    private providerApiService: ProviderApiServiceAbstraction,
  ) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      const error = qParams.providerId == null || qParams.email == null || qParams.token == null;

      if (error) {
        this.platformUtilsService.showToast(
          "error",
          null,
          this.i18nService.t("emergencyInviteAcceptFailed"),
          { timeout: 10000 },
        );
        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigate(["/"]);
        return;
      }

      this.providerId = qParams.providerId;
      this.token = qParams.token;

      // Check if provider exists, redirect if it does
      try {
        const provider = await this.providerApiService.getProvider(this.providerId);
        if (provider.name != null) {
          // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.router.navigate(["/providers", provider.id], { replaceUrl: true });
        }
      } catch (e) {
        this.validationService.showError(e);
        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigate(["/"]);
      }
    });
  }

  async submit() {
    this.formPromise = this.doSubmit();
    await this.formPromise;
    this.formPromise = null;
  }

  async doSubmit() {
    try {
      const providerKey = await this.cryptoService.makeOrgKey<ProviderKey>();
      const key = providerKey[0].encryptedString;

      const request = new ProviderSetupRequest();
      request.name = this.name;
      request.billingEmail = this.billingEmail;
      request.token = this.token;
      request.key = key;

      const enableConsolidatedBilling = await firstValueFrom(this.enableConsolidatedBilling$);

      if (enableConsolidatedBilling) {
        request.taxInfo = new ExpandedTaxInfoUpdateRequest();
        const taxInfoView = this.taxInfoComponent.taxInfo;
        request.taxInfo.country = taxInfoView.country;
        request.taxInfo.postalCode = taxInfoView.postalCode;
        if (taxInfoView.includeTaxId) {
          request.taxInfo.taxId = taxInfoView.taxId;
          request.taxInfo.line1 = taxInfoView.line1;
          request.taxInfo.line2 = taxInfoView.line2;
          request.taxInfo.city = taxInfoView.city;
          request.taxInfo.state = taxInfoView.state;
        }
      }

      const provider = await this.providerApiService.postProviderSetup(this.providerId, request);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("providerSetup"));
      await this.syncService.fullSync(true);

      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.router.navigate(["/providers", provider.id]);
    } catch (e) {
      this.validationService.showError(e);
    }
  }
}
