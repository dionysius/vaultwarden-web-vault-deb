import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

// eslint-disable-next-line no-restricted-imports
import { ExposedPasswordsReportComponent as BaseExposedPasswordsReportComponent } from "../../reports/pages/exposed-passwords-report.component";

@Component({
  selector: "app-org-exposed-passwords-report",
  templateUrl: "../../reports/pages/exposed-passwords-report.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class ExposedPasswordsReportComponent extends BaseExposedPasswordsReportComponent {
  manageableCiphers: Cipher[];

  constructor(
    cipherService: CipherService,
    auditService: AuditService,
    modalService: ModalService,
    messagingService: MessagingService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(cipherService, auditService, modalService, messagingService, passwordRepromptService);
  }

  ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.manageableCiphers = await this.cipherService.getAll();
      await this.checkAccess();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }

  canManageCipher(c: CipherView): boolean {
    return this.manageableCiphers.some((x) => x.id === c.id);
  }
}
