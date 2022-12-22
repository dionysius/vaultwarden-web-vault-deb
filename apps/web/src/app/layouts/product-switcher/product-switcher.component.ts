import { AfterViewInit, ChangeDetectorRef, Component, Input } from "@angular/core";

import { IconButtonType } from "@bitwarden/components/src/icon-button/icon-button.component";

import { flagEnabled } from "../../../utils/flags";

@Component({
  selector: "product-switcher",
  templateUrl: "./product-switcher.component.html",
})
export class ProductSwitcherComponent implements AfterViewInit {
  protected isEnabled = flagEnabled("secretsManager");

  /**
   * Passed to the product switcher's `bitIconButton`
   */
  @Input()
  buttonType: IconButtonType = "main";

  ngAfterViewInit() {
    /**
     * Resolves https://angular.io/errors/NG0100 [SM-403]
     *
     * Caused by `[bitMenuTriggerFor]="content?.menu"` in template
     */
    this.changeDetector.detectChanges();
  }

  constructor(private changeDetector: ChangeDetectorRef) {}
}
