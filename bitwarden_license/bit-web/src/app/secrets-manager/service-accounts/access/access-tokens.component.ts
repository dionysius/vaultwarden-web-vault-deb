import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationPromptComponent } from "@bitwarden/web-vault/app/shared/components/user-verification";

import { AccessTokenView } from "../models/view/access-token.view";

import { AccessService } from "./access.service";
import { AccessTokenCreateDialogComponent } from "./dialogs/access-token-create-dialog.component";

@Component({
  selector: "sm-access-tokens",
  templateUrl: "./access-tokens.component.html",
})
export class AccessTokenComponent implements OnInit {
  accessTokens$: Observable<AccessTokenView[]>;

  private serviceAccountId: string;
  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private accessService: AccessService,
    private dialogService: DialogServiceAbstraction,
    private modalService: ModalService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.accessTokens$ = this.accessService.accessToken$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
        this.organizationId = params.organizationId;
        this.serviceAccountId = params.serviceAccountId;
        return await this.getAccessTokens();
      })
    );
  }

  protected async revoke(tokens: AccessTokenView[]) {
    if (!tokens?.length) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("noAccessTokenSelected")
      );
      return;
    }

    if (!(await this.verifyUser())) {
      return;
    }

    await this.accessService.revokeAccessTokens(
      this.serviceAccountId,
      tokens.map((t) => t.id)
    );

    this.platformUtilsService.showToast("success", null, this.i18nService.t("accessTokenRevoked"));
  }

  protected openNewAccessTokenDialog() {
    AccessTokenCreateDialogComponent.openNewAccessTokenDialog(
      this.dialogService,
      this.serviceAccountId,
      this.organizationId
    );
  }

  private verifyUser() {
    const ref = this.modalService.open(UserVerificationPromptComponent, {
      allowMultipleModals: true,
      data: {
        confirmDescription: "revokeAccessTokenDesc",
        confirmButtonText: "revokeAccessToken",
        modalTitle: "revokeAccessToken",
      },
    });

    if (ref == null) {
      return;
    }

    return ref.onClosedPromise();
  }

  private async getAccessTokens(): Promise<AccessTokenView[]> {
    return await this.accessService.getAccessTokens(this.organizationId, this.serviceAccountId);
  }
}
