import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";

import { TwoFactorDuoComponent } from "../../../auth/settings/two-factor-duo.component";
import { TwoFactorSetupComponent as BaseTwoFactorSetupComponent } from "../../../auth/settings/two-factor-setup.component";

@Component({
  selector: "app-two-factor-setup",
  templateUrl: "../../../auth/settings/two-factor-setup.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class TwoFactorSetupComponent extends BaseTwoFactorSetupComponent {
  constructor(
    apiService: ApiService,
    modalService: ModalService,
    messagingService: MessagingService,
    policyService: PolicyService,
    private route: ActivatedRoute,
    stateService: StateService
  ) {
    super(apiService, modalService, messagingService, policyService, stateService);
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await super.ngOnInit();
    });
  }

  async manage(type: TwoFactorProviderType) {
    switch (type) {
      case TwoFactorProviderType.OrganizationDuo: {
        const duoComp = await this.openModal(this.duoModalRef, TwoFactorDuoComponent);
        duoComp.type = TwoFactorProviderType.OrganizationDuo;
        duoComp.organizationId = this.organizationId;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        duoComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.OrganizationDuo);
        });
        break;
      }
      default:
        break;
    }
  }

  protected getTwoFactorProviders() {
    return this.apiService.getTwoFactorOrganizationProviders(this.organizationId);
  }

  protected filterProvider(type: TwoFactorProviderType) {
    return type !== TwoFactorProviderType.OrganizationDuo;
  }
}
