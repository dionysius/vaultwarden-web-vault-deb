import { Component } from "@angular/core";

import { Icons } from "@bitwarden/components";

@Component({
  selector: "sm-no-items",
  templateUrl: "./no-items.component.html",
})
export class NoItemsComponent {
  protected icon = Icons.Search;
}
