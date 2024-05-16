import { Component, Input } from "@angular/core";

import { TypographyModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "popup-section-header",
  templateUrl: "./popup-section-header.component.html",
  imports: [TypographyModule],
})
export class PopupSectionHeaderComponent {
  @Input() title: string;
}
