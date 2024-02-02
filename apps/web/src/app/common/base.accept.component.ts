import { Directive, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Subject } from "rxjs";
import { first, switchMap, takeUntil } from "rxjs/operators";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Directive()
export abstract class BaseAcceptComponent implements OnInit {
  loading = true;
  authed = false;
  email: string;
  actionPromise: Promise<any>;

  protected requiredParameters: string[] = [];
  protected failedShortMessage = "inviteAcceptFailedShort";
  protected failedMessage = "inviteAcceptFailed";

  private destroy$ = new Subject<void>();

  constructor(
    protected router: Router,
    protected platformUtilService: PlatformUtilsService,
    protected i18nService: I18nService,
    protected route: ActivatedRoute,
    protected stateService: StateService,
  ) {}

  abstract authedHandler(qParams: Params): Promise<void>;
  abstract unauthedHandler(qParams: Params): Promise<void>;

  ngOnInit() {
    this.route.queryParams
      .pipe(
        first(),
        switchMap(async (qParams) => {
          let error = this.requiredParameters.some(
            (e) => qParams?.[e] == null || qParams[e] === "",
          );
          let errorMessage: string = null;
          if (!error) {
            this.authed = await this.stateService.getIsAuthenticated();
            this.email = qParams.email;

            if (this.authed) {
              try {
                await this.authedHandler(qParams);
              } catch (e) {
                error = true;
                errorMessage = e.message;
              }
            } else {
              await this.unauthedHandler(qParams);
            }
          }

          if (error) {
            const message =
              errorMessage != null
                ? this.i18nService.t(this.failedShortMessage, errorMessage)
                : this.i18nService.t(this.failedMessage);
            this.platformUtilService.showToast("error", null, message, { timeout: 10000 });
            // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.router.navigate(["/"]);
          }

          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
}
