import { Component, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { LoginComponent as BaseLoginComponent } from "@bitwarden/angular/components/login.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy.service";
import { PolicyData } from "@bitwarden/common/models/data/policyData";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/masterPasswordPolicyOptions";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";
import { PolicyResponse } from "@bitwarden/common/models/response/policyResponse";

import { RouterService, StateService } from "../core";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
})
export class LoginComponent extends BaseLoginComponent {
  showResetPasswordAutoEnrollWarning = false;
  enforcedPasswordPolicyOptions: MasterPasswordPolicyOptions;
  policies: ListResponse<PolicyResponse>;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    private route: ActivatedRoute,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationService,
    cryptoFunctionService: CryptoFunctionService,
    private apiService: ApiService,
    private policyService: PolicyService,
    logService: LogService,
    ngZone: NgZone,
    protected stateService: StateService,
    private messagingService: MessagingService,
    private routerService: RouterService
  ) {
    super(
      authService,
      router,
      platformUtilsService,
      i18nService,
      stateService,
      environmentService,
      passwordGenerationService,
      cryptoFunctionService,
      logService,
      ngZone
    );
    this.onSuccessfulLogin = async () => {
      this.messagingService.send("setFullWidth");
    };
    this.onSuccessfulLoginNavigate = this.goAfterLogIn;
  }

  async ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }
      if (qParams.premium != null) {
        this.routerService.setPreviousUrl("/settings/premium");
      } else if (qParams.org != null) {
        const route = this.router.createUrlTree(["create-organization"], {
          queryParams: { plan: qParams.org },
        });
        this.routerService.setPreviousUrl(route.toString());
      }

      // Are they coming from an email for sponsoring a families organization
      if (qParams.sponsorshipToken != null) {
        const route = this.router.createUrlTree(["setup/families-for-enterprise"], {
          queryParams: { token: qParams.sponsorshipToken },
        });
        this.routerService.setPreviousUrl(route.toString());
      }
      await super.ngOnInit();
      this.rememberEmail = await this.stateService.getRememberEmail();
    });

    const invite = await this.stateService.getOrganizationInvitation();
    if (invite != null) {
      let policyList: Policy[] = null;
      try {
        this.policies = await this.apiService.getPoliciesByToken(
          invite.organizationId,
          invite.token,
          invite.email,
          invite.organizationUserId
        );
        policyList = this.policyService.mapPoliciesFromToken(this.policies);
      } catch (e) {
        this.logService.error(e);
      }

      if (policyList != null) {
        const resetPasswordPolicy = this.policyService.getResetPasswordPolicyOptions(
          policyList,
          invite.organizationId
        );
        // Set to true if policy enabled and auto-enroll enabled
        this.showResetPasswordAutoEnrollWarning =
          resetPasswordPolicy[1] && resetPasswordPolicy[0].autoEnrollEnabled;

        this.enforcedPasswordPolicyOptions =
          await this.policyService.getMasterPasswordPolicyOptions(policyList);
      }
    }
  }

  async goAfterLogIn() {
    // Check master password against policy
    if (this.enforcedPasswordPolicyOptions != null) {
      const strengthResult = this.passwordGenerationService.passwordStrength(
        this.masterPassword,
        this.getPasswordStrengthUserInput()
      );
      const masterPasswordScore = strengthResult == null ? null : strengthResult.score;

      // If invalid, save policies and require update
      if (
        !this.policyService.evaluateMasterPassword(
          masterPasswordScore,
          this.masterPassword,
          this.enforcedPasswordPolicyOptions
        )
      ) {
        const policiesData: { [id: string]: PolicyData } = {};
        this.policies.data.map((p) => (policiesData[p.id] = new PolicyData(p)));
        await this.policyService.replace(policiesData);
        this.router.navigate(["update-password"]);
        return;
      }
    }

    const previousUrl = this.routerService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      this.router.navigate([this.successRoute]);
    }
  }

  async submit() {
    await this.stateService.setRememberEmail(this.rememberEmail);
    if (!this.rememberEmail) {
      await this.stateService.setRememberedEmail(null);
    }
    await super.submit();
  }

  private getPasswordStrengthUserInput() {
    let userInput: string[] = [];
    const atPosition = this.email.indexOf("@");
    if (atPosition > -1) {
      userInput = userInput.concat(
        this.email
          .substr(0, atPosition)
          .trim()
          .toLowerCase()
          .split(/[^A-Za-z0-9]/)
      );
    }
    return userInput;
  }
}
