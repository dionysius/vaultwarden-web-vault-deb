import { Component, HostBinding, Input } from "@angular/core";

import { ButtonTypes } from "../button";

@Component({
  selector: "bit-submit-button",
  templateUrl: "./submit-button.component.html",
})
export class SubmitButtonComponent {
  @Input() buttonType: ButtonTypes = "primary";
  @Input() disabled = false;
  @Input() loading: boolean;

  @Input() block?: boolean;

  @HostBinding("class") get classList() {
    return this.block == null || this.block === false ? [] : ["tw-w-full", "tw-block"];
  }
}
