import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationEnrollSecretsManagerRequest } from "@bitwarden/common/admin-console/models/request/organization/organization-enroll-secrets-manager.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { flagEnabled } from "../../../../utils/flags";

@Component({
  selector: "sm-enroll",
  templateUrl: "enroll.component.html",
})
export class SecretsManagerEnrollComponent implements OnInit {
  @Input() enabled: boolean;
  @Input() organizationId: string;

  protected formGroup = this.formBuilder.group({
    enabled: [false],
  });

  protected showSecretsManager = false;

  constructor(
    private formBuilder: FormBuilder,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private syncService: SyncService
  ) {
    this.showSecretsManager = flagEnabled("secretsManager");
  }

  ngOnInit(): void {
    this.formGroup.setValue({
      enabled: this.enabled,
    });
  }

  protected submit = async () => {
    this.formGroup.markAllAsTouched();

    const request = new OrganizationEnrollSecretsManagerRequest();
    request.enabled = this.formGroup.value.enabled;

    await this.organizationApiService.updateEnrollSecretsManager(this.organizationId, request);
    await this.syncService.fullSync(true);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("subscriptionUpdated"));
  };
}
