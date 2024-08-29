import { Component } from "@angular/core";

import {
  PassphraseSettingsComponent,
  PasswordSettingsComponent,
} from "@bitwarden/generator-components";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [PassphraseSettingsComponent, PasswordSettingsComponent],
})
export class CredentialGeneratorComponent {}
