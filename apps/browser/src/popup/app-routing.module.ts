import { Injectable, NgModule } from "@angular/core";
import { ActivatedRouteSnapshot, RouteReuseStrategy, RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/guards/auth.guard";
import { LockGuard } from "@bitwarden/angular/guards/lock.guard";
import { UnauthGuard } from "@bitwarden/angular/guards/unauth.guard";

import { AddEditComponent } from "../vault/popup/components/vault/add-edit.component";
import { AttachmentsComponent } from "../vault/popup/components/vault/attachments.component";
import { CurrentTabComponent } from "../vault/popup/components/vault/current-tab.component";
import { PasswordHistoryComponent } from "../vault/popup/components/vault/password-history.component";
import { ShareComponent } from "../vault/popup/components/vault/share.component";
import { VaultFilterComponent } from "../vault/popup/components/vault/vault-filter.component";
import { VaultItemsComponent } from "../vault/popup/components/vault/vault-items.component";
import { ViewComponent } from "../vault/popup/components/vault/view.component";

import { EnvironmentComponent } from "./accounts/environment.component";
import { HintComponent } from "./accounts/hint.component";
import { HomeComponent } from "./accounts/home.component";
import { LockComponent } from "./accounts/lock.component";
import { LoginComponent } from "./accounts/login.component";
import { RegisterComponent } from "./accounts/register.component";
import { RemovePasswordComponent } from "./accounts/remove-password.component";
import { SetPasswordComponent } from "./accounts/set-password.component";
import { SsoComponent } from "./accounts/sso.component";
import { TwoFactorOptionsComponent } from "./accounts/two-factor-options.component";
import { TwoFactorComponent } from "./accounts/two-factor.component";
import { UpdateTempPasswordComponent } from "./accounts/update-temp-password.component";
import { GeneratorComponent } from "./generator/generator.component";
import { PasswordGeneratorHistoryComponent } from "./generator/password-generator-history.component";
import { SendAddEditComponent } from "./send/send-add-edit.component";
import { SendGroupingsComponent } from "./send/send-groupings.component";
import { SendTypeComponent } from "./send/send-type.component";
import { DebounceNavigationService } from "./services/debounceNavigationService";
import { AutofillComponent } from "./settings/autofill.component";
import { ExcludedDomainsComponent } from "./settings/excluded-domains.component";
import { ExportComponent } from "./settings/export.component";
import { FolderAddEditComponent } from "./settings/folder-add-edit.component";
import { FoldersComponent } from "./settings/folders.component";
import { OptionsComponent } from "./settings/options.component";
import { PremiumComponent } from "./settings/premium.component";
import { SettingsComponent } from "./settings/settings.component";
import { SyncComponent } from "./settings/sync.component";
import { TabsComponent } from "./tabs.component";
import { CollectionsComponent } from "./vault/collections.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "vault",
    redirectTo: "/tabs/vault",
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [UnauthGuard],
    data: { state: "home" },
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [UnauthGuard],
    data: { state: "login" },
  },
  {
    path: "lock",
    component: LockComponent,
    canActivate: [LockGuard],
    data: { state: "lock" },
  },
  {
    path: "2fa",
    component: TwoFactorComponent,
    canActivate: [UnauthGuard],
    data: { state: "2fa" },
  },
  {
    path: "2fa-options",
    component: TwoFactorOptionsComponent,
    canActivate: [UnauthGuard],
    data: { state: "2fa-options" },
  },
  {
    path: "sso",
    component: SsoComponent,
    canActivate: [UnauthGuard],
    data: { state: "sso" },
  },
  {
    path: "set-password",
    component: SetPasswordComponent,
    data: { state: "set-password" },
  },
  {
    path: "remove-password",
    component: RemovePasswordComponent,
    canActivate: [AuthGuard],
    data: { state: "remove-password" },
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [UnauthGuard],
    data: { state: "register" },
  },
  {
    path: "hint",
    component: HintComponent,
    canActivate: [UnauthGuard],
    data: { state: "hint" },
  },
  {
    path: "environment",
    component: EnvironmentComponent,
    canActivate: [UnauthGuard],
    data: { state: "environment" },
  },
  {
    path: "ciphers",
    component: VaultItemsComponent,
    canActivate: [AuthGuard],
    data: { state: "ciphers" },
  },
  {
    path: "view-cipher",
    component: ViewComponent,
    canActivate: [AuthGuard],
    data: { state: "view-cipher" },
  },
  {
    path: "cipher-password-history",
    component: PasswordHistoryComponent,
    canActivate: [AuthGuard],
    data: { state: "cipher-password-history" },
  },
  {
    path: "add-cipher",
    component: AddEditComponent,
    canActivate: [AuthGuard, DebounceNavigationService],
    data: { state: "add-cipher" },
    runGuardsAndResolvers: "always",
  },
  {
    path: "edit-cipher",
    component: AddEditComponent,
    canActivate: [AuthGuard, DebounceNavigationService],
    data: { state: "edit-cipher" },
    runGuardsAndResolvers: "always",
  },
  {
    path: "share-cipher",
    component: ShareComponent,
    canActivate: [AuthGuard],
    data: { state: "share-cipher" },
  },
  {
    path: "collections",
    component: CollectionsComponent,
    canActivate: [AuthGuard],
    data: { state: "collections" },
  },
  {
    path: "attachments",
    component: AttachmentsComponent,
    canActivate: [AuthGuard],
    data: { state: "attachments" },
  },
  {
    path: "generator",
    component: GeneratorComponent,
    canActivate: [AuthGuard],
    data: { state: "generator" },
  },
  {
    path: "generator-history",
    component: PasswordGeneratorHistoryComponent,
    canActivate: [AuthGuard],
    data: { state: "generator-history" },
  },
  {
    path: "export",
    component: ExportComponent,
    canActivate: [AuthGuard],
    data: { state: "export" },
  },
  {
    path: "autofill",
    component: AutofillComponent,
    canActivate: [AuthGuard],
    data: { state: "autofill" },
  },
  {
    path: "folders",
    component: FoldersComponent,
    canActivate: [AuthGuard],
    data: { state: "folders" },
  },
  {
    path: "add-folder",
    component: FolderAddEditComponent,
    canActivate: [AuthGuard],
    data: { state: "add-folder" },
  },
  {
    path: "edit-folder",
    component: FolderAddEditComponent,
    canActivate: [AuthGuard],
    data: { state: "edit-folder" },
  },
  {
    path: "sync",
    component: SyncComponent,
    canActivate: [AuthGuard],
    data: { state: "sync" },
  },
  {
    path: "excluded-domains",
    component: ExcludedDomainsComponent,
    canActivate: [AuthGuard],
    data: { state: "excluded-domains" },
  },
  {
    path: "premium",
    component: PremiumComponent,
    canActivate: [AuthGuard],
    data: { state: "premium" },
  },
  {
    path: "options",
    component: OptionsComponent,
    canActivate: [AuthGuard],
    data: { state: "options" },
  },
  {
    path: "clone-cipher",
    component: AddEditComponent,
    canActivate: [AuthGuard],
    data: { state: "clone-cipher" },
  },
  {
    path: "send-type",
    component: SendTypeComponent,
    canActivate: [AuthGuard],
    data: { state: "send-type" },
  },
  {
    path: "add-send",
    component: SendAddEditComponent,
    canActivate: [AuthGuard],
    data: { state: "add-send" },
  },
  {
    path: "edit-send",
    component: SendAddEditComponent,
    canActivate: [AuthGuard],
    data: { state: "edit-send" },
  },
  {
    path: "update-temp-password",
    component: UpdateTempPasswordComponent,
    canActivate: [AuthGuard],
    data: { state: "update-temp-password" },
  },
  {
    path: "tabs",
    component: TabsComponent,
    data: { state: "tabs" },
    children: [
      {
        path: "",
        redirectTo: "/tabs/vault",
        pathMatch: "full",
      },
      {
        path: "current",
        component: CurrentTabComponent,
        canActivate: [AuthGuard],
        data: { state: "tabs_current" },
        runGuardsAndResolvers: "always",
      },
      {
        path: "vault",
        component: VaultFilterComponent,
        canActivate: [AuthGuard],
        data: { state: "tabs_vault" },
      },
      {
        path: "generator",
        component: GeneratorComponent,
        canActivate: [AuthGuard],
        data: { state: "tabs_generator" },
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AuthGuard],
        data: { state: "tabs_settings" },
      },
      {
        path: "send",
        component: SendGroupingsComponent,
        canActivate: [AuthGuard],
        data: { state: "tabs_send" },
      },
    ],
  },
];

@Injectable()
export class NoRouteReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot) {
    return false;
  }

  // eslint-disable-next-line
  store(route: ActivatedRouteSnapshot, handle: {}) {
    /* Nothing */
  }

  shouldAttach(route: ActivatedRouteSnapshot) {
    return false;
  }

  retrieve(route: ActivatedRouteSnapshot): any {
    return null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot) {
    return false;
  }
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: "reload",
      /*enableTracing: true,*/
    }),
  ],
  exports: [RouterModule],
  providers: [{ provide: RouteReuseStrategy, useClass: NoRouteReuseStrategy }],
})
export class AppRoutingModule {}
