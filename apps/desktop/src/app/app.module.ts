import "zone.js/dist/zone";

import { registerLocaleData } from "@angular/common";
import localeAf from "@angular/common/locales/af";
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
import localeEo from "@angular/common/locales/eo";
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
import localeMe from "@angular/common/locales/sr-Latn-ME";
import localeSv from "@angular/common/locales/sv";
import localeTh from "@angular/common/locales/th";
import localeTr from "@angular/common/locales/tr";
import localeUk from "@angular/common/locales/uk";
import localeVi from "@angular/common/locales/vi";
import localeZhCn from "@angular/common/locales/zh-Hans";
import localeZhTw from "@angular/common/locales/zh-Hant";
import { NgModule } from "@angular/core";

import { ColorPasswordCountPipe } from "@bitwarden/angular/pipes/color-password-count.pipe";
import { ColorPasswordPipe } from "@bitwarden/angular/pipes/color-password.pipe";

import { CollectionsComponent } from "../app/vault/collections.component";
import { ExportComponent } from "../app/vault/export.component";
import { GeneratorComponent } from "../app/vault/generator.component";
import { PasswordGeneratorHistoryComponent } from "../app/vault/password-generator-history.component";
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

registerLocaleData(localeAf, "af");
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
registerLocaleData(localeEo, "eo");
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
registerLocaleData(localeLv, "lv");
registerLocaleData(localeMe, "me");
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
