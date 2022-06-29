import { Component, Input } from "@angular/core";

import { ButtonTypes } from "../button";

@Component({
  selector: "bit-submit-button",
  templateUrl: "./submit-button.component.html",
})
export class SubmitButtonComponent {
  @Input() buttonType: ButtonTypes = "primary";
  @Input() disabled = false;
  @Input() loading: boolean;
}
