import { Directive, HostListener, Input, OnDestroy, Optional } from "@angular/core";
import { BehaviorSubject, finalize, Subject, takeUntil, tap } from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

import { ButtonLikeAbstraction } from "../shared/button-like.abstraction";
import { FunctionReturningAwaitable, functionToObservable } from "../utils/function-to-observable";

/**
 * Allow a single button to perform async actions on click and reflect the progress in the UI by automatically
 * activating the loading effect while the action is processed.
 */
@Directive({
  selector: "[bitAction]",
})
export class BitActionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private _loading$ = new BehaviorSubject<boolean>(false);

  @Input("bitAction") protected handler: FunctionReturningAwaitable;

  readonly loading$ = this._loading$.asObservable();

  constructor(
    private buttonComponent: ButtonLikeAbstraction,
    @Optional() private validationService?: ValidationService
  ) {}

  get loading() {
    return this._loading$.value;
  }

  set loading(value: boolean) {
    this._loading$.next(value);
    this.buttonComponent.loading = value;
  }

  @HostListener("click")
  protected async onClick() {
    if (!this.handler) {
      return;
    }

    this.loading = true;
    functionToObservable(this.handler)
      .pipe(
        tap({ error: (err: unknown) => this.validationService?.showError(err) }),
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
