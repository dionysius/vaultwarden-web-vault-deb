import { Component, HostBinding, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { Icon, isIcon } from "./icon";

@Component({
  selector: "bit-icon",
  template: ``,
})
export class BitIconComponent {
  @Input() icon: Icon;

  @HostBinding()
  protected get innerHtml() {
    if (!isIcon(this.icon)) {
      return "";
    }

    const svg = this.icon.svg;
    return this.domSanitizer.bypassSecurityTrustHtml(svg);
  }

  constructor(private domSanitizer: DomSanitizer) {}
}
