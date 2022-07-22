import { Component, Input } from "@angular/core";

@Component({
  selector: "bit-modal",
  templateUrl: "./modal.component.html",
})
export class ModalComponent {
  @Input() modalSize: "small" | "default" | "large";

  get width() {
    switch (this.modalSize) {
      case "small": {
        return "tw-max-w-xs";
      }
      case "large": {
        return "tw-max-w-4xl";
      }
      default: {
        return "tw-max-w-xl";
      }
    }
  }
}
