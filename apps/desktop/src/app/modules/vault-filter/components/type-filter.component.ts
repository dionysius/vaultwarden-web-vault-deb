import { Component } from "@angular/core";

import { TypeFilterComponent as BaseTypeFilterComponent } from "@bitwarden/angular/modules/vault-filter/components/type-filter.component";

@Component({
  selector: "app-type-filter",
  templateUrl: "type-filter.component.html",
})
export class TypeFilterComponent extends BaseTypeFilterComponent {}
