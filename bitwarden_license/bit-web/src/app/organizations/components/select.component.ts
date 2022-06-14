import { Component, Input } from "@angular/core";

import { SelectOptions } from "@bitwarden/angular/interfaces/selectOptions";

import { BaseCvaComponent } from "./base-cva.component";

/** For use in the SSO Config Form only - will be deprecated by the Component Library */
@Component({
  selector: "app-select",
  templateUrl: "select.component.html",
})
export class SelectComponent extends BaseCvaComponent {
  @Input() selectOptions: SelectOptions[];
}
