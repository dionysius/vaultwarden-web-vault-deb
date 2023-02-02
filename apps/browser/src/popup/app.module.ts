import { A11yModule } from "@angular/cdk/a11y";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { LayoutModule } from "@angular/cdk/layout";
import { OverlayModule } from "@angular/cdk/overlay";
import { ScrollingModule } from "@angular/cdk/scrolling";
// eslint-disable-next-line import/order
import { CurrencyPipe, DatePipe } from "@angular/common";

// Register the locales for the application
import "./locales";

import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { BitwardenToastModule } from "@bitwarden/angular/components/toastr.component";
import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ColorPasswordCountPipe } from "@bitwarden/angular/pipes/color-password-count.pipe";
import { ColorPasswordPipe } from "@bitwarden/angular/pipes/color-password.pipe";

import { CollectionsComponent } from "../popup/vault/collections.component";
import { ActionButtonsComponent } from "../vault/popup/components/action-buttons.component";
import { CipherRowComponent } from "../vault/popup/components/cipher-row.component";
import { PasswordRepromptComponent } from "../vault/popup/components/password-reprompt.component";
import { AddEditCustomFieldsComponent } from "../vault/popup/components/vault/add-edit-custom-fields.component";
import { AddEditComponent } from "../vault/popup/components/vault/add-edit.component";
import { AttachmentsComponent } from "../vault/popup/components/vault/attachments.component";
import { CurrentTabComponent } from "../vault/popup/components/vault/current-tab.component";
import { PasswordHistoryComponent } from "../vault/popup/components/vault/password-history.component";
import { ShareComponent } from "../vault/popup/components/vault/share.component";
import { VaultFilterComponent } from "../vault/popup/components/vault/vault-filter.component";
import { VaultItemsComponent } from "../vault/popup/components/vault/vault-items.component";
import { VaultSelectComponent } from "../vault/popup/components/vault/vault-select.component";
import { ViewCustomFieldsComponent } from "../vault/popup/components/vault/view-custom-fields.component";
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
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PopOutComponent } from "./components/pop-out.component";
import { PrivateModeWarningComponent } from "./components/private-mode-warning.component";
import { SendListComponent } from "./components/send-list.component";
import { SetPinComponent } from "./components/set-pin.component";
import { UserVerificationComponent } from "./components/user-verification.component";
import { GeneratorComponent } from "./generator/generator.component";
import { PasswordGeneratorHistoryComponent } from "./generator/password-generator-history.component";
import { EffluxDatesComponent as SendEffluxDatesComponent } from "./send/efflux-dates.component";
import { SendAddEditComponent } from "./send/send-add-edit.component";
import { SendGroupingsComponent } from "./send/send-groupings.component";
import { SendTypeComponent } from "./send/send-type.component";
import { ServicesModule } from "./services/services.module";
import { AboutComponent } from "./settings/about.component";
import { AutofillComponent } from "./settings/autofill.component";
import { ExcludedDomainsComponent } from "./settings/excluded-domains.component";
import { ExportComponent } from "./settings/export.component";
import { FolderAddEditComponent } from "./settings/folder-add-edit.component";
import { FoldersComponent } from "./settings/folders.component";
import { OptionsComponent } from "./settings/options.component";
import { PremiumComponent } from "./settings/premium.component";
import { SettingsComponent } from "./settings/settings.component";
import { SyncComponent } from "./settings/sync.component";
import { VaultTimeoutInputComponent } from "./settings/vault-timeout-input.component";
import { TabsComponent } from "./tabs.component";

@NgModule({
  imports: [
    A11yModule,
    AppRoutingModule,
    BitwardenToastModule.forRoot({
      maxOpened: 2,
      autoDismiss: true,
      closeButton: true,
      positionClass: "toast-bottom-full-width",
    }),
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FormsModule,
    JslibModule,
    LayoutModule,
    OverlayModule,
    ReactiveFormsModule,
    ScrollingModule,
    ServicesModule,
  ],
  declarations: [
    ActionButtonsComponent,
    AddEditComponent,
    AddEditCustomFieldsComponent,
    AppComponent,
    AttachmentsComponent,
    CipherRowComponent,
    VaultItemsComponent,
    CollectionsComponent,
    ColorPasswordPipe,
    ColorPasswordCountPipe,
    CurrentTabComponent,
    EnvironmentComponent,
    ExcludedDomainsComponent,
    ExportComponent,
    FolderAddEditComponent,
    FoldersComponent,
    VaultFilterComponent,
    HintComponent,
    HomeComponent,
    LockComponent,
    LoginComponent,
    OptionsComponent,
    GeneratorComponent,
    PasswordGeneratorHistoryComponent,
    PasswordHistoryComponent,
    PasswordRepromptComponent,
    PopOutComponent,
    PremiumComponent,
    PrivateModeWarningComponent,
    RegisterComponent,
    SendAddEditComponent,
    SendEffluxDatesComponent,
    SendGroupingsComponent,
    SendListComponent,
    SendTypeComponent,
    SetPasswordComponent,
    SetPinComponent,
    SettingsComponent,
    ShareComponent,
    SsoComponent,
    SyncComponent,
    TabsComponent,
    TwoFactorComponent,
    TwoFactorOptionsComponent,
    UpdateTempPasswordComponent,
    UserVerificationComponent,
    VaultTimeoutInputComponent,
    ViewComponent,
    ViewCustomFieldsComponent,
    RemovePasswordComponent,
    VaultSelectComponent,
    AboutComponent,
    AutofillComponent,
  ],
  providers: [CurrencyPipe, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
