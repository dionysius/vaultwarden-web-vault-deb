import { Component, inject } from "@angular/core";

import { BaseLoginDecryptionOptionsComponent } from "@bitwarden/angular/auth/components/base-login-decryption-options.component";

import { RouterService } from "../../../core";
import { AcceptOrganizationInviteService } from "../../organization-invite/accept-organization.service";
@Component({
  selector: "web-login-decryption-options",
  templateUrl: "login-decryption-options.component.html",
})
export class LoginDecryptionOptionsComponent extends BaseLoginDecryptionOptionsComponent {
  protected routerService = inject(RouterService);
  protected acceptOrganizationInviteService = inject(AcceptOrganizationInviteService);

  override async createUser(): Promise<void> {
    try {
      await super.createUser();

      // Invites from TDE orgs go through here, but the invite is
      // accepted while being enrolled in admin recovery. So we need to clear
      // the redirect and stored org invite.
      await this.routerService.getAndClearLoginRedirectUrl();
      await this.acceptOrganizationInviteService.clearOrganizationInvitation();

      await this.router.navigate(["/vault"]);
    } catch (error) {
      this.validationService.showError(error);
    }
  }

  createUserAction = async (): Promise<void> => {
    return this.createUser();
  };
}
