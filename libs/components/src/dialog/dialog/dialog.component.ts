import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-dialog",
  templateUrl: "./dialog.component.html",
})
export class DialogComponent {
  @Input() dialogSize: "small" | "default" | "large" = "default";

  get width() {
    switch (this.dialogSize) {
      case "small": {
        return "tw-w-96";
      }
      case "large": {
        return "tw-w-75vw";
      }
      default: {
        return "tw-w-50vw";
      }
    }
  }
}
