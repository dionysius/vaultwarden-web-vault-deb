import { NgModule } from "@angular/core";

import { CoreAuthModule } from "./core";
import { SettingsModule } from "./settings/settings.module";

@NgModule({
  imports: [CoreAuthModule, SettingsModule],
  declarations: [],
  providers: [],
  exports: [SettingsModule],
})
export class AuthModule {}
