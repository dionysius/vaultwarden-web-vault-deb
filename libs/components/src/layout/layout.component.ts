import { Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

import { LinkModule } from "../link";
import { SharedModule } from "../shared";

export type LayoutVariant = "primary" | "secondary";

@Component({
  selector: "bit-layout",
  templateUrl: "layout.component.html",
  standalone: true,
  imports: [SharedModule, LinkModule, RouterModule],
})
export class LayoutComponent {
  protected mainContentId = "main-content";

  @Input() variant: LayoutVariant = "primary";

  focusMainContent() {
    document.getElementById(this.mainContentId)?.focus();
  }
}
