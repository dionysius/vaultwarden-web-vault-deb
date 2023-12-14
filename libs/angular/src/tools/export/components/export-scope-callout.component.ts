import { Component, Input, OnInit } from "@angular/core";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Component({
  selector: "app-export-scope-callout",
  templateUrl: "export-scope-callout.component.html",
})
export class ExportScopeCalloutComponent implements OnInit {
  show = false;
  scopeConfig: {
    title: string;
    description: string;
    scopeIdentifier: string;
  };

  private _organizationId: string;

  get organizationId(): string {
    return this._organizationId;
  }

  @Input() set organizationId(value: string) {
    this._organizationId = value;
    this.getScopeMessage(this._organizationId);
  }

  constructor(
    protected organizationService: OrganizationService,
    protected stateService: StateService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.organizationService.hasOrganizations()) {
      return;
    }

    await this.getScopeMessage(this.organizationId);
    this.show = true;
  }

  private async getScopeMessage(organizationId: string) {
    this.scopeConfig =
      organizationId != null
        ? {
            title: "exportingOrganizationVaultTitle",
            description: "exportingOrganizationVaultDesc",
            scopeIdentifier: this.organizationService.get(organizationId).name,
          }
        : {
            title: "exportingPersonalVaultTitle",
            description: "exportingIndividualVaultDescription",
            scopeIdentifier: await this.stateService.getEmail(),
          };
  }
}
