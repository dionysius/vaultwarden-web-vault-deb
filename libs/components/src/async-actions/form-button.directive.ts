import { Directive, Input, OnDestroy, Optional } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";

import { BitSubmitDirective } from "./bit-submit.directive";

import { BitActionDirective } from ".";

/**
 * This directive has two purposes:
 *
 * When attached to a submit button:
 * - Activates the button loading effect while the form is processing an async submit action.
 * - Disables the button while a `bitAction` directive on another button is being processed.
 *
 * When attached to a standalone button with `bitAction` directive:
 * - Disables the form while the `bitAction` directive is processing an async submit action.
 */
@Directive({
  selector: "button[bitFormButton]",
})
export class BitFormButtonDirective implements OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() type: string;

  constructor(
    buttonComponent: ButtonLikeAbstraction,
    @Optional() submitDirective?: BitSubmitDirective,
    @Optional() actionDirective?: BitActionDirective
  ) {
    if (submitDirective && buttonComponent) {
      submitDirective.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
        if (this.type === "submit") {
          buttonComponent.loading = loading;
        } else {
          buttonComponent.disabled = loading;
        }
      });

      submitDirective.disabled$.pipe(takeUntil(this.destroy$)).subscribe((disabled) => {
        buttonComponent.disabled = disabled;
      });
    }

    if (submitDirective && actionDirective) {
      actionDirective.loading$.pipe(takeUntil(this.destroy$)).subscribe((disabled) => {
        submitDirective.disabled = disabled;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
