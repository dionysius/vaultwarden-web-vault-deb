import { Component } from "@angular/core";

import { SectionComponent } from "@bitwarden/components";
import { UsernameGeneratorComponent } from "@bitwarden/generator-components";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [UsernameGeneratorComponent, SectionComponent],
})
export class CredentialGeneratorComponent {}
