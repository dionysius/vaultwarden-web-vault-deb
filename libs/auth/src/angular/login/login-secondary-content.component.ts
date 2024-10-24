import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { RegisterRouteService } from "@bitwarden/auth/common";
import { LinkModule } from "@bitwarden/components";

@Component({
  standalone: true,
  imports: [CommonModule, JslibModule, LinkModule, RouterModule],
  template: `
    <div class="tw-text-center">
      {{ "newToBitwarden" | i18n }}
      <a bitLink [routerLink]="registerRoute$ | async">{{ "createAccount" | i18n }}</a>
    </div>
  `,
})
export class LoginSecondaryContentComponent {
  registerRouteService = inject(RegisterRouteService);

  // TODO: remove when email verification flag is removed
  protected registerRoute$ = this.registerRouteService.registerRoute$();
}
