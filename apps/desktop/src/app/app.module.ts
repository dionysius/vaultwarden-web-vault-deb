import "zone.js/dist/zone";

// Register the locales for the application
import "./locales";

import { NgModule } from "@angular/core";

import { ColorPasswordCountPipe } from "@bitwarden/angular/pipes/color-password-count.pipe";
import { ColorPasswordPipe } from "@bitwarden/angular/pipes/color-password.pipe";

import { PremiumComponent } from "../vault/app/accounts/premium.component";
import { PasswordRepromptComponent } from "../vault/app/components/password-reprompt.component";
import { AddEditCustomFieldsComponent } from "../vault/app/vault/add-edit-custom-fields.component";
import { AddEditComponent } from "../vault/app/vault/add-edit.component";
import { AttachmentsComponent } from "../vault/app/vault/attachments.component";
import { FolderAddEditComponent } from "../vault/app/vault/folder-add-edit.component";
import { PasswordHistoryComponent } from "../vault/app/vault/password-history.component";
import { ShareComponent } from "../vault/app/vault/share.component";
import { VaultFilterModule } from "../vault/app/vault/vault-filter/vault-filter.module";
import { VaultItemsComponent } from "../vault/app/vault/vault-items.component";
import { VaultComponent } from "../vault/app/vault/vault.component";
import { ViewCustomFieldsComponent } from "../vault/app/vault/view-custom-fields.component";
import { ViewComponent } from "../vault/app/vault/view.component";

import { AccessibilityCookieComponent } from "./accounts/accessibility-cookie.component";
import { DeleteAccountComponent } from "./accounts/delete-account.component";
import { EnvironmentComponent } from "./accounts/environment.component";
import { HintComponent } from "./accounts/hint.component";
import { LockComponent } from "./accounts/lock.component";
import { LoginComponent } from "./accounts/login.component";
import { RegisterComponent } from "./accounts/register.component";
import { RemovePasswordComponent } from "./accounts/remove-password.component";
import { SetPasswordComponent } from "./accounts/set-password.component";
import { SettingsComponent } from "./accounts/settings.component";
import { SsoComponent } from "./accounts/sso.component";
import { TwoFactorOptionsComponent } from "./accounts/two-factor-options.component";
import { TwoFactorComponent } from "./accounts/two-factor.component";
import { UpdateTempPasswordComponent } from "./accounts/update-temp-password.component";
import { VaultTimeoutInputComponent } from "./accounts/vault-timeout-input.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SetPinComponent } from "./components/set-pin.component";
import { UserVerificationComponent } from "./components/user-verification.component";
import { AccountSwitcherComponent } from "./layout/account-switcher.component";
import { HeaderComponent } from "./layout/header.component";
import { NavComponent } from "./layout/nav.component";
import { SearchComponent } from "./layout/search/search.component";
import { AddEditComponent as SendAddEditComponent } from "./send/add-edit.component";
import { EffluxDatesComponent as SendEffluxDatesComponent } from "./send/efflux-dates.component";
import { SendComponent } from "./send/send.component";
import { SharedModule } from "./shared/shared.module";
import { CollectionsComponent } from "./vault/collections.component";
import { ExportComponent } from "./vault/export.component";
import { GeneratorComponent } from "./vault/generator.component";
import { PasswordGeneratorHistoryComponent } from "./vault/password-generator-history.component";

@NgModule({
  imports: [SharedModule, AppRoutingModule, VaultFilterModule],
  declarations: [
    AccessibilityCookieComponent,
    AccountSwitcherComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AppComponent,
    AttachmentsComponent,
    VaultItemsComponent,
    CollectionsComponent,
    ColorPasswordPipe,
    ColorPasswordCountPipe,
    DeleteAccountComponent,
    EnvironmentComponent,
    ExportComponent,
    FolderAddEditComponent,
    HeaderComponent,
    HintComponent,
    LockComponent,
    LoginComponent,
    NavComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordHistoryComponent,
    PasswordRepromptComponent,
    PremiumComponent,
    RegisterComponent,
    RemovePasswordComponent,
    SearchComponent,
    SendAddEditComponent,
    SendComponent,
    SendEffluxDatesComponent,
    SetPasswordComponent,
    SetPinComponent,
    SettingsComponent,
    ShareComponent,
    SsoComponent,
    TwoFactorComponent,
    TwoFactorOptionsComponent,
    UpdateTempPasswordComponent,
    UserVerificationComponent,
    VaultComponent,
    VaultTimeoutInputComponent,
    ViewComponent,
    ViewCustomFieldsComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
