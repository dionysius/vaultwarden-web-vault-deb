import { Component, HostBinding, Input, booleanAttribute } from "@angular/core";

let nextId = 0;

@Component({
  selector: "bit-disclosure",
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class DisclosureComponent {
  /**
   * Optionally init the disclosure in its opened state
   */
  @Input({ transform: booleanAttribute }) open?: boolean = false;

  @HostBinding("class") get classList() {
    return this.open ? "" : "tw-hidden";
  }

  @HostBinding("id") id = `bit-disclosure-${nextId++}`;
}
