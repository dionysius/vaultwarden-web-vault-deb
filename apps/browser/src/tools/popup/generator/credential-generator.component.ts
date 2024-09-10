import { Component } from "@angular/core";

import { PasswordGeneratorComponent } from "@bitwarden/generator-components";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [PasswordGeneratorComponent],
})
export class CredentialGeneratorComponent {}
