import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { DeleteRecoverRequest } from "@bitwarden/common/models/request/delete-recover.request";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  selector: "app-recover-delete",
  templateUrl: "recover-delete.component.html",
})
export class RecoverDeleteComponent {
  protected recoverDeleteForm = new FormGroup({
    email: new FormControl("", [Validators.required]),
  });

  get email() {
    return this.recoverDeleteForm.controls.email;
  }

  constructor(
    private router: Router,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
  ) {}

  submit = async () => {
    if (this.recoverDeleteForm.invalid) {
      return;
    }

    const request = new DeleteRecoverRequest();
    request.email = this.email.value.trim().toLowerCase();
    await this.apiService.postAccountRecoverDelete(request);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("deleteRecoverEmailSent"),
    );

    await this.router.navigate(["/"]);
  };
}
