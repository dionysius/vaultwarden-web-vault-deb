import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
})
export class HomeComponent implements OnInit {
  loginInitiated = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
  });

  constructor(
    protected platformUtilsService: PlatformUtilsService,
    private stateService: StateService,
    private formBuilder: FormBuilder,
    private router: Router,
    private i18nService: I18nService,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute
  ) {}
  async ngOnInit(): Promise<void> {
    const rememberedEmail = await this.stateService.getRememberedEmail();
    if (rememberedEmail != null) {
      this.formGroup.patchValue({ email: await this.stateService.getRememberedEmail() });
    }
  }

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccured"),
        this.i18nService.t("invalidEmail")
      );
      return;
    }

    this.stateService.setRememberedEmail(this.formGroup.value.email);

    this.router.navigate(["login"], { queryParams: { email: this.formGroup.value.email } });
  }

  get selfHostedDomain() {
    return this.environmentService.hasBaseUrl() ? this.environmentService.getWebVaultUrl() : null;
  }
}
