import { Component } from "@angular/core";

import { PassphraseSettingsComponent } from "@bitwarden/generator-components";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [PassphraseSettingsComponent],
})
export class CredentialGeneratorComponent {}
