import { Component, HostListener } from "@angular/core";
import { IsActiveMatchOptions } from "@angular/router";
import { BehaviorSubject, map } from "rxjs";

import { NavBaseComponent } from "./nav-base.component";

@Component({
  selector: "bit-nav-item",
  templateUrl: "./nav-item.component.html",
})
export class NavItemComponent extends NavBaseComponent {
  /**
   * Is `true` if `to` matches the current route
   */
  private _active = false;
  protected setActive(isActive: boolean) {
    this._active = isActive;
  }
  protected get showActiveStyles() {
    return this._active && !this.hideActiveStyles;
  }
  protected readonly rlaOptions: IsActiveMatchOptions = {
    paths: "exact",
    queryParams: "exact",
    fragment: "ignored",
    matrixParams: "ignored",
  };

  /**
   * The design spec calls for the an outline to wrap the entire element when the template's anchor/button has :focus-visible.
   * Usually, we would use :focus-within for this. However, that matches when a child element has :focus instead of :focus-visible.
   *
   * Currently, the browser does not have a pseudo selector that combines these two, e.g. :focus-visible-within (WICG/focus-visible#151)
   * To make our own :focus-visible-within functionality, we use event delegation on the host and manually check if the focus target (denoted with the .fvw class) matches :focus-visible. We then map that state to some styles, so the entire component can have an outline.
   */
  protected focusVisibleWithin$ = new BehaviorSubject(false);
  protected fvwStyles$ = this.focusVisibleWithin$.pipe(
    map((value) => (value ? "tw-z-10 tw-rounded tw-outline-none tw-ring tw-ring-text-alt2" : ""))
  );
  @HostListener("focusin", ["$event.target"])
  onFocusIn(target: HTMLElement) {
    this.focusVisibleWithin$.next(target.matches(".fvw:focus-visible"));
  }
  @HostListener("focusout")
  onFocusOut() {
    this.focusVisibleWithin$.next(false);
  }
}
