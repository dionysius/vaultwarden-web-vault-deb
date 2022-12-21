import { Component, Input } from "@angular/core";

import { IconButtonType } from "@bitwarden/components/src/icon-button/icon-button.component";

import { flagEnabled } from "../../../utils/flags";

@Component({
  selector: "product-switcher",
  templateUrl: "./product-switcher.component.html",
})
export class ProductSwitcherComponent {
  protected isEnabled = flagEnabled("secretsManager");

  /**
   * Passed to the product switcher's `bitIconButton`
   */
  @Input()
  buttonType: IconButtonType = "main";
}
