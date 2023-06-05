import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  EMPTY,
  Subject,
  catchError,
  combineLatest,
  filter,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { AccessTokenCreateDialogComponent } from "./access/dialogs/access-token-create-dialog.component";
import { ServiceAccountService } from "./service-account.service";

@Component({
  selector: "sm-service-account",
  templateUrl: "./service-account.component.html",
})
export class ServiceAccountComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private organizationId: string;
  private serviceAccountId: string;

  private onChange$ = this.serviceAccountService.serviceAccount$.pipe(
    filter((sa) => sa?.id === this.serviceAccountId),
    startWith(null)
  );

  protected serviceAccount$ = combineLatest([this.route.params, this.onChange$]).pipe(
    switchMap(([params, _]) =>
      this.serviceAccountService.getByServiceAccountId(
        params.serviceAccountId,
        params.organizationId
      )
    ),
    catchError(() => {
      this.router.navigate(["/sm", this.organizationId, "service-accounts"]).then(() => {
        this.platformUtilsService.showToast(
          "error",
          null,
          this.i18nService.t("notFound", this.i18nService.t("serviceAccount"))
        );
      });
      return EMPTY;
    })
  );

  constructor(
    private route: ActivatedRoute,
    private serviceAccountService: ServiceAccountService,
    private dialogService: DialogServiceAbstraction,
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.serviceAccountId = params.serviceAccountId;
      this.organizationId = params.organizationId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected openNewAccessTokenDialog() {
    AccessTokenCreateDialogComponent.openNewAccessTokenDialog(
      this.dialogService,
      this.serviceAccountId,
      this.organizationId
    );
  }
}
