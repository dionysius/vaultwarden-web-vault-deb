import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { map, Observable, Subject, takeUntil } from "rxjs";

import { notAllowedValueAsync } from "@bitwarden/angular/validators/notAllowedValueAsync.validator";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PlanSponsorshipType } from "@bitwarden/common/enums/planSponsorshipType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

interface RequestSponsorshipForm {
  selectedSponsorshipOrgId: FormControl<string>;
  sponsorshipEmail: FormControl<string>;
}

@Component({
  selector: "app-sponsored-families",
  templateUrl: "sponsored-families.component.html",
})
export class SponsoredFamiliesComponent implements OnInit, OnDestroy {
  loading = false;

  availableSponsorshipOrgs$: Observable<Organization[]>;
  activeSponsorshipOrgs$: Observable<Organization[]>;
  anyOrgsAvailable$: Observable<boolean>;
  anyActiveSponsorships$: Observable<boolean>;

  // Conditional display properties
  formPromise: Promise<void>;

  sponsorshipForm: FormGroup<RequestSponsorshipForm>;

  private _destroy = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private syncService: SyncService,
    private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private stateService: StateService
  ) {
    this.sponsorshipForm = this.formBuilder.group<RequestSponsorshipForm>({
      selectedSponsorshipOrgId: new FormControl("", {
        validators: [Validators.required],
      }),
      sponsorshipEmail: new FormControl("", {
        validators: [Validators.email],
        asyncValidators: [
          notAllowedValueAsync(async () => await this.stateService.getEmail(), true),
        ],
        updateOn: "blur",
      }),
    });
  }

  async ngOnInit() {
    this.availableSponsorshipOrgs$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs.filter((o) => o.familySponsorshipAvailable))
    );

    this.availableSponsorshipOrgs$.pipe(takeUntil(this._destroy)).subscribe((orgs) => {
      if (orgs.length === 1) {
        this.sponsorshipForm.patchValue({
          selectedSponsorshipOrgId: orgs[0].id,
        });
      }
    });

    this.anyOrgsAvailable$ = this.availableSponsorshipOrgs$.pipe(map((orgs) => orgs.length > 0));

    this.activeSponsorshipOrgs$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs.filter((o) => o.familySponsorshipFriendlyName !== null))
    );

    this.anyActiveSponsorships$ = this.activeSponsorshipOrgs$.pipe(map((orgs) => orgs.length > 0));

    this.loading = false;
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  async submit() {
    this.formPromise = this.apiService.postCreateSponsorship(
      this.sponsorshipForm.value.selectedSponsorshipOrgId,
      {
        sponsoredEmail: this.sponsorshipForm.value.sponsorshipEmail,
        planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
        friendlyName: this.sponsorshipForm.value.sponsorshipEmail,
      }
    );

    await this.formPromise;
    this.platformUtilsService.showToast("success", null, this.i18nService.t("sponsorshipCreated"));
    this.formPromise = null;
    this.resetForm();
    await this.forceReload();
  }

  async forceReload() {
    this.loading = true;
    await this.syncService.fullSync(true);
    this.loading = false;
  }

  get sponsorshipEmailControl() {
    return this.sponsorshipForm.controls.sponsorshipEmail;
  }

  private async resetForm() {
    this.sponsorshipForm.reset();
  }

  get isSelfHosted(): boolean {
    return this.platformUtilsService.isSelfHost();
  }
}
