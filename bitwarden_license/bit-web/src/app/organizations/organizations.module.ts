import { NgModule } from "@angular/core";

import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { InputCheckboxComponent } from "./components/input-checkbox.component";
import { InputTextReadOnlyComponent } from "./components/input-text-readonly.component";
import { InputTextComponent } from "./components/input-text.component";
import { SelectComponent } from "./components/select.component";
import { ScimComponent } from "./manage/scim.component";
import { SsoComponent } from "./manage/sso.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

// Form components are for use in the SSO Configuration Form only and should not be exported for use elsewhere.
// They will be deprecated by the Component Library.
@NgModule({
  imports: [SharedModule, OrganizationsRoutingModule],
  declarations: [
    InputCheckboxComponent,
    InputTextComponent,
    InputTextReadOnlyComponent,
    SelectComponent,
    SsoComponent,
    ScimComponent,
  ],
})
export class OrganizationsModule {}
