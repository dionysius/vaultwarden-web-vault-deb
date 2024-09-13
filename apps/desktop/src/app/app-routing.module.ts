import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { EnvironmentSelectorComponent } from "@bitwarden/angular/auth/components/environment-selector.component";
import { unauthUiRefreshSwap } from "@bitwarden/angular/auth/functions/unauth-ui-refresh-route-swap";
import {
  authGuard,
  lockGuard,
  redirectGuard,
  tdeDecryptionRequiredGuard,
  unauthGuardFn,
} from "@bitwarden/angular/auth/guards";
import { canAccessFeature } from "@bitwarden/angular/platform/guard/feature-flag.guard";
import {
  AnonLayoutWrapperComponent,
  AnonLayoutWrapperData,
  PasswordHintComponent,
  RegistrationFinishComponent,
  RegistrationStartComponent,
  RegistrationStartSecondaryComponent,
  RegistrationStartSecondaryComponentData,
  SetPasswordJitComponent,
  UserLockIcon,
} from "@bitwarden/auth/angular";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { twofactorRefactorSwap } from "../../../../libs/angular/src/utils/two-factor-component-refactor-route-swap";
import { AccessibilityCookieComponent } from "../auth/accessibility-cookie.component";
import { maxAccountsGuardFn } from "../auth/guards/max-accounts.guard";
import { HintComponent } from "../auth/hint.component";
import { LockComponent } from "../auth/lock.component";
import { LoginDecryptionOptionsComponent } from "../auth/login/login-decryption-options/login-decryption-options.component";
import { LoginViaAuthRequestComponent } from "../auth/login/login-via-auth-request.component";
import { LoginComponent } from "../auth/login/login.component";
import { RegisterComponent } from "../auth/register.component";
import { RemovePasswordComponent } from "../auth/remove-password.component";
import { SetPasswordComponent } from "../auth/set-password.component";
import { SsoComponent } from "../auth/sso.component";
import { TwoFactorAuthComponent } from "../auth/two-factor-auth.component";
import { TwoFactorComponent } from "../auth/two-factor.component";
import { UpdateTempPasswordComponent } from "../auth/update-temp-password.component";
import { VaultComponent } from "../vault/app/vault/vault.component";

import { SendComponent } from "./tools/send/send.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    children: [], // Children lets us have an empty component.
    canActivate: [redirectGuard({ loggedIn: "/vault", loggedOut: "/login", locked: "/lock" })],
  },
  {
    path: "lock",
    component: LockComponent,
    canActivate: [lockGuard()],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [maxAccountsGuardFn()],
  },
  {
    path: "login-with-device",
    component: LoginViaAuthRequestComponent,
  },
  {
    path: "admin-approval-requested",
    component: LoginViaAuthRequestComponent,
  },
  ...twofactorRefactorSwap(
    TwoFactorComponent,
    AnonLayoutWrapperComponent,
    {
      path: "2fa",
    },
    {
      path: "2fa",
      component: AnonLayoutWrapperComponent,
      children: [
        {
          path: "",
          component: TwoFactorAuthComponent,
          canActivate: [unauthGuardFn()],
        },
      ],
    },
  ),
  {
    path: "login-initiated",
    component: LoginDecryptionOptionsComponent,
    canActivate: [tdeDecryptionRequiredGuard()],
  },
  { path: "register", component: RegisterComponent },
  {
    path: "vault",
    component: VaultComponent,
    canActivate: [authGuard],
  },
  { path: "accessibility-cookie", component: AccessibilityCookieComponent },
  { path: "set-password", component: SetPasswordComponent },
  { path: "sso", component: SsoComponent },
  {
    path: "send",
    component: SendComponent,
    canActivate: [authGuard],
  },
  {
    path: "update-temp-password",
    component: UpdateTempPasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: "remove-password",
    component: RemovePasswordComponent,
    canActivate: [authGuard],
    data: { titleId: "removeMasterPassword" },
  },
  ...unauthUiRefreshSwap(
    HintComponent,
    AnonLayoutWrapperComponent,
    {
      path: "hint",
      canActivate: [unauthGuardFn()],
      data: {
        pageTitle: "passwordHint",
        titleId: "passwordHint",
      },
    },
    {
      path: "",
      children: [
        {
          path: "hint",
          canActivate: [unauthGuardFn()],
          data: {
            pageTitle: "requestPasswordHint",
            pageSubtitle: "enterYourAccountEmailAddressAndYourPasswordHintWillBeSentToYou",
            pageIcon: UserLockIcon,
            state: "hint",
          },
          children: [
            { path: "", component: PasswordHintComponent },
            {
              path: "",
              component: EnvironmentSelectorComponent,
              outlet: "environment-selector",
            },
          ],
        },
      ],
    },
  ),
  {
    path: "",
    component: AnonLayoutWrapperComponent,
    children: [
      {
        path: "signup",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification), unauthGuardFn()],
        data: { pageTitle: "createAccount" } satisfies AnonLayoutWrapperData,
        children: [
          {
            path: "",
            component: RegistrationStartComponent,
          },
          {
            path: "",
            component: RegistrationStartSecondaryComponent,
            outlet: "secondary",
            data: {
              loginRoute: "/login",
            } satisfies RegistrationStartSecondaryComponentData,
          },
        ],
      },
      {
        path: "finish-signup",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification), unauthGuardFn()],
        data: {
          pageTitle: "setAStrongPassword",
          pageSubtitle: "finishCreatingYourAccountBySettingAPassword",
        } satisfies AnonLayoutWrapperData,
        children: [
          {
            path: "",
            component: RegistrationFinishComponent,
          },
        ],
      },
      {
        path: "set-password-jit",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification)],
        component: SetPasswordJitComponent,
        data: {
          pageTitle: "joinOrganization",
          pageSubtitle: "finishJoiningThisOrganizationBySettingAMasterPassword",
        } satisfies AnonLayoutWrapperData,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      /*enableTracing: true,*/
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
