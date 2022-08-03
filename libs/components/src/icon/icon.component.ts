import { Component, HostBinding, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { Icon, IconSvg } from "./icons";

@Component({
  selector: "bit-icon",
  template: ``,
})
export class BitIconComponent {
  @Input() icon: Icon;

  constructor(private domSanitizer: DomSanitizer) {}

  @HostBinding("innerHtml")
  protected get innerHtml() {
    const svg = IconSvg[this.icon];
    if (svg == null) {
      return "Unknown icon";
    }

    return this.domSanitizer.bypassSecurityTrustHtml(IconSvg[this.icon]);
  }
}
