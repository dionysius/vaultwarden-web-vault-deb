import { Component } from "@angular/core";

import { Icons } from "..";

/**
 * Component for displaying a message when there are no items to display. Expects title, description and button slots.
 */
@Component({
  selector: "bit-no-items",
  templateUrl: "./no-items.component.html",
})
export class NoItemsComponent {
  protected icon = Icons.Search;
}
