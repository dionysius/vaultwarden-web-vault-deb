import {
  DEFAULT_DIALOG_CONFIG,
  Dialog,
  DialogConfig,
  DialogRef,
  DIALOG_SCROLL_STRATEGY,
} from "@angular/cdk/dialog";
import { ComponentType, Overlay, OverlayContainer } from "@angular/cdk/overlay";
import {
  Inject,
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  TemplateRef,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subject, switchMap, takeUntil } from "rxjs";

import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";

@Injectable()
export class DialogService extends Dialog implements OnDestroy {
  private _destroy$ = new Subject<void>();

  override open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    config = {
      backdropClass: ["tw-fixed", "tw-bg-black", "tw-bg-opacity-30", "tw-inset-0", "tw-z-40"],
      ...config,
    };

    return super.open(componentOrTemplateRef, config);
  }

  constructor(
    /** Parent class constructor */
    _overlay: Overlay,
    _injector: Injector,
    @Optional() @Inject(DEFAULT_DIALOG_CONFIG) _defaultOptions: DialogConfig,
    @Optional() @SkipSelf() _parentDialog: Dialog,
    _overlayContainer: OverlayContainer,
    @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,

    /** Not in parent class */
    @Optional() router: Router,
    @Optional() authService: AuthService
  ) {
    super(_overlay, _injector, _defaultOptions, _parentDialog, _overlayContainer, scrollStrategy);

    /** Close all open dialogs if the vault locks */
    if (router && authService) {
      router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          switchMap(() => authService.getAuthStatus()),
          filter((v) => v !== AuthenticationStatus.Unlocked),
          takeUntil(this._destroy$)
        )
        .subscribe(() => this.closeAll());
    }
  }

  override ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    super.ngOnDestroy();
  }
}
