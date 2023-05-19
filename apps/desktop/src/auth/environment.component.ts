import { Component } from "@angular/core";

import { EnvironmentComponent as BaseEnvironmentComponent } from "@bitwarden/angular/components/environment.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-environment",
  templateUrl: "environment.component.html",
})
export class EnvironmentComponent extends BaseEnvironmentComponent {
  constructor(
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    i18nService: I18nService,
    modalService: ModalService
  ) {
    super(platformUtilsService, environmentService, i18nService, modalService);
  }
}
