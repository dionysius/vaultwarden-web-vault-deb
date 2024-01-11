import { Directive, ElementRef, Input, NgZone, Optional } from "@angular/core";
import { take } from "rxjs/operators";

import { Utils } from "@bitwarden/common/platform/misc/utils";

/**
 * Interface for implementing focusable components. Used by the AutofocusDirective.
 */
export abstract class FocusableElement {
  focus: () => void;
}

/**
 * Directive to focus an element.
 *
 * @remarks
 *
 * If the component provides the `FocusableElement` interface, the `focus`
 * method will be called. Otherwise, the native element will be focused.
 */
@Directive({
  selector: "[appAutofocus], [bitAutofocus]",
})
export class AutofocusDirective {
  @Input() set appAutofocus(condition: boolean | string) {
    this.autofocus = condition === "" || condition === true;
  }

  private autofocus: boolean;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    @Optional() private focusableElement: FocusableElement,
  ) {}

  ngOnInit() {
    if (!Utils.isMobileBrowser && this.autofocus) {
      if (this.ngZone.isStable) {
        this.focus();
      } else {
        this.ngZone.onStable.pipe(take(1)).subscribe(this.focus.bind(this));
      }
    }
  }

  private focus() {
    if (this.focusableElement) {
      this.focusableElement.focus();
    } else {
      this.el.nativeElement.focus();
    }
  }
}
