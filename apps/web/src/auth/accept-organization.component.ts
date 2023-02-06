import { Component } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserAcceptRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { Policy } from "@bitwarden/common/models/domain/policy";

import { BaseAcceptComponent } from "../app/common/base.accept.component";

@Component({
  selector: "app-accept-organization",
  templateUrl: "accept-organization.component.html",
})
export class AcceptOrganizationComponent extends BaseAcceptComponent {
  orgName: string;

  protected requiredParameters: string[] = ["organizationId", "organizationUserId", "token"];

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    stateService: StateService,
    private cryptoService: CryptoService,
    private policyApiService: PolicyApiServiceAbstraction,
    private policyService: PolicyService,
    private logService: LogService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private organizationUserService: OrganizationUserService,
    private messagingService: MessagingService
  ) {
    super(router, platformUtilsService, i18nService, route, stateService);
  }

  async authedHandler(qParams: Params): Promise<void> {
    const needsReAuth = (await this.stateService.getOrganizationInvitation()) != null;
    if (!needsReAuth) {
      // Accepting an org invite requires authentication from a logged out state
      this.messagingService.send("logout", { redirect: false });
      await this.prepareOrganizationInvitation(qParams);
      return;
    }

    // User has already logged in and passed the Master Password policy check
    this.actionPromise = this.prepareAcceptRequest(qParams).then(async (request) => {
      await this.organizationUserService.postOrganizationUserAccept(
        qParams.organizationId,
        qParams.organizationUserId,
        request
      );
    });

    await this.stateService.setOrganizationInvitation(null);
    await this.actionPromise;
    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.i18nService.t("inviteAcceptedDesc"),
      { timeout: 10000 }
    );

    this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: Params): Promise<void> {
    await this.prepareOrganizationInvitation(qParams);
  }

  private async prepareAcceptRequest(qParams: Params): Promise<OrganizationUserAcceptRequest> {
    const request = new OrganizationUserAcceptRequest();
    request.token = qParams.token;

    if (await this.performResetPasswordAutoEnroll(qParams)) {
      const response = await this.organizationApiService.getKeys(qParams.organizationId);

      if (response == null) {
        throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
      }

      const publicKey = Utils.fromB64ToArray(response.publicKey);

      // RSA Encrypt user's encKey.key with organization public key
      const encKey = await this.cryptoService.getEncKey();
      const encryptedKey = await this.cryptoService.rsaEncrypt(encKey.key, publicKey.buffer);

      // Add reset password key to accept request
      request.resetPasswordKey = encryptedKey.encryptedString;
    }
    return request;
  }

  private async performResetPasswordAutoEnroll(qParams: Params): Promise<boolean> {
    let policyList: Policy[] = null;
    try {
      const policies = await this.policyApiService.getPoliciesByToken(
        qParams.organizationId,
        qParams.token,
        qParams.email,
        qParams.organizationUserId
      );
      policyList = this.policyService.mapPoliciesFromToken(policies);
    } catch (e) {
      this.logService.error(e);
    }

    if (policyList != null) {
      const result = this.policyService.getResetPasswordPolicyOptions(
        policyList,
        qParams.organizationId
      );
      // Return true if policy enabled and auto-enroll enabled
      return result[1] && result[0].autoEnrollEnabled;
    }

    return false;
  }

  private async prepareOrganizationInvitation(qParams: Params): Promise<void> {
    this.orgName = qParams.organizationName;
    if (this.orgName != null) {
      // Fix URL encoding of space issue with Angular
      this.orgName = this.orgName.replace(/\+/g, " ");
    }
    await this.stateService.setOrganizationInvitation(qParams);
  }
}
