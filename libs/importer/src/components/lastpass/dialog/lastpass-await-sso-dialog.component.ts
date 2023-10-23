import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule, DialogModule, DialogService } from "@bitwarden/components";

@Component({
  templateUrl: "lastpass-await-sso-dialog.component.html",
  standalone: true,
  imports: [JslibModule, ButtonModule, DialogModule],
})
export class LastPassAwaitSSODialogComponent {
  static open(dialogService: DialogService) {
    return dialogService.open<boolean>(LastPassAwaitSSODialogComponent);
  }
}
