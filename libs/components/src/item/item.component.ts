import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostListener, signal } from "@angular/core";

import { A11yRowDirective } from "../a11y/a11y-row.directive";

import { ItemActionComponent } from "./item-action.component";

@Component({
  selector: "bit-item",
  standalone: true,
  imports: [CommonModule, ItemActionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "item.component.html",
  providers: [{ provide: A11yRowDirective, useExisting: ItemComponent }],
})
export class ItemComponent extends A11yRowDirective {
  /**
   * We have `:focus-within` and `:focus-visible` but no `:focus-visible-within`
   */
  protected focusVisibleWithin = signal(false);
  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.focusVisibleWithin.set(target.matches(".fvw-target:focus-visible"));
  }
  @HostListener("focusout")
  onFocusOut() {
    this.focusVisibleWithin.set(false);
  }
}
