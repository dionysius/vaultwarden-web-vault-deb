import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, HostBinding, Input } from "@angular/core";

import { fadeIn } from "../animations";

@Component({
  selector: "bit-dialog",
  templateUrl: "./dialog.component.html",
  animations: [fadeIn],
})
export class DialogComponent {
  @Input() dialogSize: "small" | "default" | "large" = "default";

  private _disablePadding = false;
  @Input() set disablePadding(value: boolean | "") {
    this._disablePadding = coerceBooleanProperty(value);
  }
  get disablePadding() {
    return this._disablePadding;
  }

  @HostBinding("class") get classes() {
    return ["tw-flex", "tw-flex-col", "tw-max-h-screen", "tw-w-screen", "tw-p-4"].concat(
      this.width
    );
  }

  get width() {
    switch (this.dialogSize) {
      case "small": {
        return "tw-max-w-sm";
      }
      case "large": {
        return "tw-max-w-3xl";
      }
      default: {
        return "tw-max-w-xl";
      }
    }
  }
}
