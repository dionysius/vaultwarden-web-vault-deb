import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

// eslint-disable-next-line no-restricted-imports
import { WeakPasswordsReportComponent as BaseWeakPasswordsReportComponent } from "../../reports/pages/weak-passwords-report.component";

@Component({
  selector: "app-weak-passwords-report",
  templateUrl: "../../reports/pages/weak-passwords-report.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class WeakPasswordsReportComponent extends BaseWeakPasswordsReportComponent {
  manageableCiphers: Cipher[];

  constructor(
    cipherService: CipherService,
    passwordGenerationService: PasswordGenerationService,
    modalService: ModalService,
    messagingService: MessagingService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(
      cipherService,
      passwordGenerationService,
      modalService,
      messagingService,
      passwordRepromptService
    );
  }

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.manageableCiphers = await this.cipherService.getAll();
      await super.ngOnInit();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }

  canManageCipher(c: CipherView): boolean {
    return this.manageableCiphers.some((x) => x.id === c.id);
  }
}
