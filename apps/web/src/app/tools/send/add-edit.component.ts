import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { AddEditComponent as BaseAddEditComponent } from "@bitwarden/angular/tools/send/add-edit.component";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { SendApiService } from "@bitwarden/common/tools/send/services/send-api.service.abstraction";
import { SendService } from "@bitwarden/common/tools/send/services/send.service.abstraction";

@Component({
  selector: "app-send-add-edit",
  templateUrl: "add-edit.component.html",
})
export class AddEditComponent extends BaseAddEditComponent {
  override componentName = "app-send-add-edit";

  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    environmentService: EnvironmentService,
    datePipe: DatePipe,
    sendService: SendService,
    stateService: StateService,
    messagingService: MessagingService,
    policyService: PolicyService,
    logService: LogService,
    sendApiService: SendApiService,
    dialogService: DialogServiceAbstraction
  ) {
    super(
      i18nService,
      platformUtilsService,
      environmentService,
      datePipe,
      sendService,
      messagingService,
      policyService,
      logService,
      stateService,
      sendApiService,
      dialogService
    );
  }

  async copyLinkToClipboard(link: string): Promise<void | boolean> {
    // Copy function on web depends on the modal being open or not. Since this event occurs during a transition
    // of the modal closing we need to add a small delay to make sure state of the DOM is consistent.
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(super.copyLinkToClipboard(link)), 500);
    });
  }
}
