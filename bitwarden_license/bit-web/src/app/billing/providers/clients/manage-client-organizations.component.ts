import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, from, lastValueFrom, map } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { ProviderUserType } from "@bitwarden/common/admin-console/enums";
import { Provider } from "@bitwarden/common/admin-console/models/domain/provider";
import { ProviderOrganizationOrganizationDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-organization.response";
import { BillingApiServiceAbstraction as BillingApiService } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { canAccessBilling } from "@bitwarden/common/billing/abstractions/provider-billing.service.abstraction";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { DialogService, ToastService } from "@bitwarden/components";

import { BaseClientsComponent } from "../../../admin-console/providers/clients/base-clients.component";
import { WebProviderService } from "../../../admin-console/providers/services/web-provider.service";

import {
  CreateClientOrganizationResultType,
  openCreateClientOrganizationDialog,
} from "./create-client-organization.component";
import { ManageClientOrganizationSubscriptionComponent } from "./manage-client-organization-subscription.component";

@Component({
  templateUrl: "manage-client-organizations.component.html",
})
export class ManageClientOrganizationsComponent extends BaseClientsComponent {
  providerId: string;
  provider: Provider;

  loading = true;
  manageOrganizations = false;

  protected plans: PlanResponse[];

  constructor(
    private apiService: ApiService,
    private billingApiService: BillingApiService,
    private configService: ConfigService,
    private providerService: ProviderService,
    private router: Router,
    activatedRoute: ActivatedRoute,
    dialogService: DialogService,
    i18nService: I18nService,
    searchService: SearchService,
    toastService: ToastService,
    validationService: ValidationService,
    webProviderService: WebProviderService,
  ) {
    super(
      activatedRoute,
      dialogService,
      i18nService,
      searchService,
      toastService,
      validationService,
      webProviderService,
    );
  }

  ngOnInit() {
    this.activatedRoute.parent.params
      .pipe(
        switchMap((params) => {
          this.providerId = params.providerId;
          return this.providerService.get$(this.providerId).pipe(
            canAccessBilling(this.configService),
            map((canAccessBilling) => {
              if (!canAccessBilling) {
                return from(
                  this.router.navigate(["../clients"], {
                    relativeTo: this.activatedRoute,
                  }),
                );
              } else {
                return from(this.load());
              }
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  async load() {
    this.provider = await firstValueFrom(this.providerService.get$(this.providerId));

    this.manageOrganizations = this.provider.type === ProviderUserType.ProviderAdmin;

    this.clients = (await this.apiService.getProviderClients(this.providerId)).data;

    this.dataSource.data = this.clients;

    this.plans = (await this.billingApiService.getPlans()).data;

    this.loading = false;
  }

  async manageSubscription(organization: ProviderOrganizationOrganizationDetailsResponse) {
    if (organization == null) {
      return;
    }

    const dialogRef = ManageClientOrganizationSubscriptionComponent.open(this.dialogService, {
      organization: organization,
    });

    await firstValueFrom(dialogRef.closed);
    await this.load();
  }

  createClientOrganization = async () => {
    const reference = openCreateClientOrganizationDialog(this.dialogService, {
      data: {
        providerId: this.providerId,
        plans: this.plans,
      },
    });

    const result = await lastValueFrom(reference.closed);

    if (result === CreateClientOrganizationResultType.Closed) {
      return;
    }

    await this.load();
  };
}
