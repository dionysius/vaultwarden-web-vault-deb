import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { EnvironmentComponent as BaseEnvironmentComponent } from "@bitwarden/angular/auth/components/environment.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { BrowserEnvironmentService } from "../../platform/services/browser-environment.service";

@Component({
  selector: "app-environment",
  templateUrl: "environment.component.html",
})
export class EnvironmentComponent extends BaseEnvironmentComponent implements OnInit {
  showEditedManagedSettings = false;

  constructor(
    platformUtilsService: PlatformUtilsService,
    public environmentService: BrowserEnvironmentService,
    i18nService: I18nService,
    private router: Router,
    modalService: ModalService,
  ) {
    super(platformUtilsService, environmentService, i18nService, modalService);
    this.showCustom = true;
  }

  async ngOnInit() {
    this.showEditedManagedSettings = await this.environmentService.settingsHaveChanged();
  }

  async resetEnvironment() {
    const urls = await this.environmentService.getManagedEnvironment();

    this.baseUrl = urls.base;
    this.webVaultUrl = urls.webVault;
    this.apiUrl = urls.api;
    this.iconsUrl = urls.icons;
    this.identityUrl = urls.identity;
    this.notificationsUrl = urls.notifications;
    this.iconsUrl = urls.icons;
  }

  saved() {
    super.saved();
    this.router.navigate([""]);
  }
}
