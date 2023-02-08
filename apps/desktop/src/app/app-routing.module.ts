import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/auth/guards/auth.guard";
import { LockGuard } from "@bitwarden/angular/auth/guards/lock.guard";

import { AccessibilityCookieComponent } from "../auth/accessibility-cookie.component";
import { LoginGuard } from "../auth/guards/login.guard";
import { HintComponent } from "../auth/hint.component";
import { LockComponent } from "../auth/lock.component";
import { LoginWithDeviceComponent } from "../auth/login/login-with-device.component";
import { LoginComponent } from "../auth/login/login.component";
import { RegisterComponent } from "../auth/register.component";
import { RemovePasswordComponent } from "../auth/remove-password.component";
import { SetPasswordComponent } from "../auth/set-password.component";
import { SsoComponent } from "../auth/sso.component";
import { TwoFactorComponent } from "../auth/two-factor.component";
import { UpdateTempPasswordComponent } from "../auth/update-temp-password.component";
import { VaultComponent } from "../vault/app/vault/vault.component";

import { SendComponent } from "./send/send.component";

const routes: Routes = [
  { path: "", redirectTo: "/vault", pathMatch: "full" },
  {
    path: "lock",
    component: LockComponent,
    canActivate: [LockGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: "login-with-device",
    component: LoginWithDeviceComponent,
  },
  { path: "2fa", component: TwoFactorComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "vault",
    component: VaultComponent,
    canActivate: [AuthGuard],
  },
  { path: "accessibility-cookie", component: AccessibilityCookieComponent },
  { path: "hint", component: HintComponent },
  { path: "set-password", component: SetPasswordComponent },
  { path: "sso", component: SsoComponent },
  {
    path: "send",
    component: SendComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "update-temp-password",
    component: UpdateTempPasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "remove-password",
    component: RemovePasswordComponent,
    canActivate: [AuthGuard],
    data: { titleId: "removeMasterPassword" },
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
