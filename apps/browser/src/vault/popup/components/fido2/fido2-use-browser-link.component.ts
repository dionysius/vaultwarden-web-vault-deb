import { Component } from "@angular/core";
import { firstValueFrom } from "rxjs";

import {
  BrowserFido2UserInterfaceSession,
  fido2PopoutSessionData$,
} from "../../../fido2/browser-fido2-user-interface.service";

@Component({
  selector: "app-fido2-use-browser-link",
  templateUrl: "fido2-use-browser-link.component.html",
})
export class Fido2UseBrowserLinkComponent {
  protected fido2PopoutSessionData$ = fido2PopoutSessionData$();

  protected async abort() {
    const sessionData = await firstValueFrom(this.fido2PopoutSessionData$);
    BrowserFido2UserInterfaceSession.abortPopout(sessionData.sessionId, true);
    return;
  }
}
