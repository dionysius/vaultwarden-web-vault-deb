import { SelectionModel } from "@angular/cdk/collections";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, firstValueFrom, from, lastValueFrom, Subject } from "rxjs";
import { first, switchMap, takeUntil } from "rxjs/operators";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { ProviderUserType } from "@bitwarden/common/admin-console/enums";
import { ProviderOrganizationOrganizationDetailsResponse } from "@bitwarden/common/admin-console/models/response/provider/provider-organization.response";
import { BillingApiServiceAbstraction as BillingApiService } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { PlanResponse } from "@bitwarden/common/billing/models/response/plan.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { DialogService, TableDataSource } from "@bitwarden/components";

import { WebProviderService } from "../../../admin-console/providers/services/web-provider.service";

import {
  CreateClientOrganizationResultType,
  openCreateClientOrganizationDialog,
} from "./create-client-organization.component";
import { ManageClientOrganizationSubscriptionComponent } from "./manage-client-organization-subscription.component";

@Component({
  templateUrl: "manage-client-organizations.component.html",
})

// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class ManageClientOrganizationsComponent implements OnInit, OnDestroy {
  providerId: string;
  loading = true;
  manageOrganizations = false;

  private destroy$ = new Subject<void>();
  private _searchText$ = new BehaviorSubject<string>("");
  private isSearching: boolean = false;

  get searchText() {
    return this._searchText$.value;
  }

  set searchText(search: string) {
    this._searchText$.value;

    this.selection.clear();
    this.dataSource.filter = search;
  }

  clients: ProviderOrganizationOrganizationDetailsResponse[];
  pagedClients: ProviderOrganizationOrganizationDetailsResponse[];

  protected didScroll = false;
  protected pageSize = 100;
  protected actionPromise: Promise<unknown>;
  private pagedClientsCount = 0;
  selection = new SelectionModel<string>(true, []);
  protected dataSource = new TableDataSource<ProviderOrganizationOrganizationDetailsResponse>();
  protected plans: PlanResponse[];

  constructor(
    private route: ActivatedRoute,
    private providerService: ProviderService,
    private apiService: ApiService,
    private searchService: SearchService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private validationService: ValidationService,
    private webProviderService: WebProviderService,
    private dialogService: DialogService,
    private billingApiService: BillingApiService,
  ) {}

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.params.subscribe(async (params) => {
      this.providerId = params.providerId;

      await this.load();

      /* eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe, rxjs/no-nested-subscribe */
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.searchText = qParams.search;
      });
    });

    this._searchText$
      .pipe(
        switchMap((searchText) => from(this.searchService.isSearchable(searchText))),
        takeUntil(this.destroy$),
      )
      .subscribe((isSearchable) => {
        this.isSearching = isSearchable;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    const clientsResponse = await this.apiService.getProviderClients(this.providerId);
    this.clients =
      clientsResponse.data != null && clientsResponse.data.length > 0 ? clientsResponse.data : [];
    this.dataSource.data = this.clients;
    this.manageOrganizations =
      (await this.providerService.get(this.providerId)).type === ProviderUserType.ProviderAdmin;

    const plansResponse = await this.billingApiService.getPlans();
    this.plans = plansResponse.data;

    this.loading = false;
  }

  isPaging() {
    const searching = this.isSearching;
    if (searching && this.didScroll) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.resetPaging();
    }
    return !searching && this.clients && this.clients.length > this.pageSize;
  }

  async resetPaging() {
    this.pagedClients = [];
    this.loadMore();
  }

  loadMore() {
    if (!this.clients || this.clients.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedClients.length;
    let pagedSize = this.pageSize;
    if (pagedLength === 0 && this.pagedClientsCount > this.pageSize) {
      pagedSize = this.pagedClientsCount;
    }
    if (this.clients.length > pagedLength) {
      this.pagedClients = this.pagedClients.concat(
        this.clients.slice(pagedLength, pagedLength + pagedSize),
      );
    }
    this.pagedClientsCount = this.pagedClients.length;
    this.didScroll = this.pagedClients.length > this.pageSize;
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

  async remove(organization: ProviderOrganizationOrganizationDetailsResponse) {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: organization.organizationName,
      content: { key: "detachOrganizationConfirmation" },
      type: "warning",
    });

    if (!confirmed) {
      return false;
    }

    this.actionPromise = this.webProviderService.detachOrganization(
      this.providerId,
      organization.id,
    );
    try {
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("detachedOrganization", organization.organizationName),
      );
      await this.load();
    } catch (e) {
      this.validationService.showError(e);
    }
    this.actionPromise = null;
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
