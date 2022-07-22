import { Component, ContentChild, Directive } from "@angular/core";

@Directive({ selector: "[bit-modal-icon]" })
export class IconDirective {}

@Component({
  selector: "bit-simple-modal",
  templateUrl: "./modal-simple.component.html",
})
export class ModalSimpleComponent {
  @ContentChild(IconDirective) icon!: IconDirective;

  get hasIcon() {
    return this.icon != null;
  }
}
