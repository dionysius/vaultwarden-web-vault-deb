import { Component } from "@angular/core";

import { PasswordRepromptComponent as BasePasswordRepromptComponent } from "@bitwarden/angular/vault/components/password-reprompt.component";

@Component({
  templateUrl: "password-reprompt.component.html",
})
export class PasswordRepromptComponent extends BasePasswordRepromptComponent {}
