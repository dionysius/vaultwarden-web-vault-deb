import { NgModule, Optional, SkipSelf } from "@angular/core";

import { WebauthnLoginApiService } from "./services/webauthn-login/webauthn-login-api.service";
import { WebauthnLoginService } from "./services/webauthn-login/webauthn-login.service";

@NgModule({
  providers: [WebauthnLoginService, WebauthnLoginApiService],
})
export class CoreAuthModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreAuthModule) {
    if (parentModule) {
      throw new Error("CoreAuthModule is already loaded. Import it in AuthModule only");
    }
  }
}
