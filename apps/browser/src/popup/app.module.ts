import { A11yModule } from "@angular/cdk/a11y";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { LayoutModule } from "@angular/cdk/layout";
import { OverlayModule } from "@angular/cdk/overlay";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CurrencyPipe, DatePipe, registerLocaleData } from "@angular/common";
import localeAr from "@angular/common/locales/ar";
import localeAz from "@angular/common/locales/az";
import localeBe from "@angular/common/locales/be";
import localeBg from "@angular/common/locales/bg";
import localeBn from "@angular/common/locales/bn";
import localeBs from "@angular/common/locales/bs";
import localeCa from "@angular/common/locales/ca";
import localeCs from "@angular/common/locales/cs";
import localeDa from "@angular/common/locales/da";
import localeDe from "@angular/common/locales/de";
import localeEl from "@angular/common/locales/el";
import localeEnGb from "@angular/common/locales/en-GB";
import localeEnIn from "@angular/common/locales/en-IN";
import localeEs from "@angular/common/locales/es";
import localeEt from "@angular/common/locales/et";
import localeEu from "@angular/common/locales/eu";
import localeFa from "@angular/common/locales/fa";
import localeFi from "@angular/common/locales/fi";
import localeFil from "@angular/common/locales/fil";
import localeFr from "@angular/common/locales/fr";
import localeHe from "@angular/common/locales/he";
import localeHi from "@angular/common/locales/hi";
import localeHr from "@angular/common/locales/hr";
import localeHu from "@angular/common/locales/hu";
import localeId from "@angular/common/locales/id";
import localeIt from "@angular/common/locales/it";
import localeJa from "@angular/common/locales/ja";
import localeKa from "@angular/common/locales/ka";
import localeKm from "@angular/common/locales/km";
import localeKn from "@angular/common/locales/kn";
import localeKo from "@angular/common/locales/ko";
import localeLt from "@angular/common/locales/lt";
import localeLv from "@angular/common/locales/lv";
import localeMl from "@angular/common/locales/ml";
import localeNb from "@angular/common/locales/nb";
import localeNl from "@angular/common/locales/nl";
import localeNn from "@angular/common/locales/nn";
import localePl from "@angular/common/locales/pl";
import localePtBr from "@angular/common/locales/pt";
import localePtPt from "@angular/common/locales/pt-PT";
import localeRo from "@angular/common/locales/ro";
import localeRu from "@angular/common/locales/ru";
import localeSi from "@angular/common/locales/si";
import localeSk from "@angular/common/locales/sk";
import localeSl from "@angular/common/locales/sl";
import localeSr from "@angular/common/locales/sr";
import localeSv from "@angular/common/locales/sv";
import localeTh from "@angular/common/locales/th";
import localeTr from "@angular/common/locales/tr";
import localeUk from "@angular/common/locales/uk";
import localeVi from "@angular/common/locales/vi";
import localeZhCn from "@angular/common/locales/zh-Hans";
import localeZhTw from "@angular/common/locales/zh-Hant";
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

registerLocaleData(localeAr, "ar");
registerLocaleData(localeAz, "az");
registerLocaleData(localeBe, "be");
registerLocaleData(localeBg, "bg");
registerLocaleData(localeBn, "bn");
registerLocaleData(localeBs, "bs");
registerLocaleData(localeCa, "ca");
registerLocaleData(localeCs, "cs");
registerLocaleData(localeDa, "da");
registerLocaleData(localeDe, "de");
registerLocaleData(localeEl, "el");
registerLocaleData(localeEnGb, "en-GB");
registerLocaleData(localeEnIn, "en-IN");
registerLocaleData(localeEs, "es");
registerLocaleData(localeEt, "et");
registerLocaleData(localeEu, "eu");
registerLocaleData(localeFa, "fa");
registerLocaleData(localeFi, "fi");
registerLocaleData(localeFil, "fil");
registerLocaleData(localeFr, "fr");
registerLocaleData(localeHe, "he");
registerLocaleData(localeHi, "hi");
registerLocaleData(localeHr, "hr");
registerLocaleData(localeHu, "hu");
registerLocaleData(localeId, "id");
registerLocaleData(localeIt, "it");
registerLocaleData(localeJa, "ja");
registerLocaleData(localeKa, "ka");
registerLocaleData(localeKm, "km");
registerLocaleData(localeKn, "kn");
registerLocaleData(localeKo, "ko");
registerLocaleData(localeLt, "lt");
registerLocaleData(localeLv, "lv");
registerLocaleData(localeMl, "ml");
registerLocaleData(localeNb, "nb");
registerLocaleData(localeNl, "nl");
registerLocaleData(localeNn, "nn");
registerLocaleData(localePl, "pl");
registerLocaleData(localePtBr, "pt-BR");
registerLocaleData(localePtPt, "pt-PT");
registerLocaleData(localeRo, "ro");
registerLocaleData(localeRu, "ru");
registerLocaleData(localeSi, "si");
registerLocaleData(localeSk, "sk");
registerLocaleData(localeSl, "sl");
registerLocaleData(localeSr, "sr");
registerLocaleData(localeSv, "sv");
registerLocaleData(localeTh, "th");
registerLocaleData(localeTr, "tr");
registerLocaleData(localeUk, "uk");
registerLocaleData(localeVi, "vi");
registerLocaleData(localeZhCn, "zh-CN");
registerLocaleData(localeZhTw, "zh-TW");

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
  ],
  providers: [CurrencyPipe, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
