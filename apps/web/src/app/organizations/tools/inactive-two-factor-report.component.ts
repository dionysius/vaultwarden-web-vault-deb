import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

// eslint-disable-next-line no-restricted-imports
import { InactiveTwoFactorReportComponent as BaseInactiveTwoFactorReportComponent } from "../../reports/pages/inactive-two-factor-report.component";

@Component({
  selector: "app-inactive-two-factor-report",
  templateUrl: "../../reports/pages/inactive-two-factor-report.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class InactiveTwoFactorReportComponent extends BaseInactiveTwoFactorReportComponent {
  constructor(
    cipherService: CipherService,
    modalService: ModalService,
    messagingService: MessagingService,
    private route: ActivatedRoute,
    logService: LogService,
    passwordRepromptService: PasswordRepromptService,
    private organizationService: OrganizationService
  ) {
    super(cipherService, modalService, messagingService, logService, passwordRepromptService);
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      await super.ngOnInit();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }
}
