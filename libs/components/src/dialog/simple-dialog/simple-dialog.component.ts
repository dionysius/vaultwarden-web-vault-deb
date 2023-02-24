import { Component, ContentChild, Directive } from "@angular/core";

import { fadeIn } from "../animations";

@Directive({ selector: "[bitDialogIcon]" })
export class IconDirective {}

@Component({
  selector: "bit-simple-dialog",
  templateUrl: "./simple-dialog.component.html",
  animations: [fadeIn],
})
export class SimpleDialogComponent {
  @ContentChild(IconDirective) icon!: IconDirective;

  get hasIcon() {
    return this.icon != null;
  }
}
