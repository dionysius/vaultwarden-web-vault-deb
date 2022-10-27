import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { GeneratorComponent as BaseGeneratorComponent } from "@bitwarden/angular/components/generator.component";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { UsernameGenerationService } from "@bitwarden/common/abstractions/usernameGeneration.service";

import { PasswordGeneratorHistoryComponent } from "./password-generator-history.component";

@Component({
  selector: "app-generator",
  templateUrl: "generator.component.html",
})
export class GeneratorComponent extends BaseGeneratorComponent {
  @ViewChild("historyTemplate", { read: ViewContainerRef, static: true })
  historyModalRef: ViewContainerRef;

  constructor(
    passwordGenerationService: PasswordGenerationService,
    usernameGenerationService: UsernameGenerationService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    logService: LogService,
    route: ActivatedRoute,
    private modalService: ModalService
  ) {
    super(
      passwordGenerationService,
      usernameGenerationService,
      platformUtilsService,
      stateService,
      i18nService,
      logService,
      route,
      window
    );
    if (platformUtilsService.isSelfHost()) {
      // Cannot use Firefox Relay on self hosted web vaults due to CORS issues with Firefox Relay API
      this.forwardOptions.splice(
        this.forwardOptions.findIndex((o) => o.value === "firefoxrelay"),
        1
      );
      // Also cannot use Duck Duck Go on self hosted web vaults due to CORS issues
      this.forwardOptions.splice(
        this.forwardOptions.findIndex((o) => o.value === "duckduckgo"),
        1
      );
    }
  }

  async history() {
    await this.modalService.openViewRef(PasswordGeneratorHistoryComponent, this.historyModalRef);
  }

  lengthChanged() {
    document.getElementById("length").focus();
  }

  minNumberChanged() {
    document.getElementById("min-number").focus();
  }

  minSpecialChanged() {
    document.getElementById("min-special").focus();
  }
}
