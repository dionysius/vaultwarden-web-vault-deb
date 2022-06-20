import { Component } from "@angular/core";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ModalConfig } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationUserBulkRequest } from "@bitwarden/common/models/request/organizationUserBulkRequest";

import { BulkUserDetails } from "./bulk-status.component";

@Component({
  selector: "app-bulk-deactivate",
  templateUrl: "bulk-deactivate.component.html",
})
export class BulkDeactivateComponent {
  isDeactivating: boolean;
  organizationId: string;
  users: BulkUserDetails[];

  statuses: Map<string, string> = new Map();

  loading = false;
  done = false;
  error: string;

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    private modalRef: ModalRef,
    config: ModalConfig
  ) {
    this.isDeactivating = config.data.isDeactivating;
    this.organizationId = config.data.organizationId;
    this.users = config.data.users;
  }

  get bulkTitle() {
    const titleKey = this.isDeactivating ? "deactivateUsers" : "activateUsers";
    return this.i18nService.t(titleKey);
  }

  get usersWarning() {
    const warningKey = this.isDeactivating ? "deactivateUsersWarning" : "activateUsersWarning";
    return this.i18nService.t(warningKey);
  }

  async submit() {
    this.loading = true;
    try {
      const response = await this.performBulkUserAction();

      const bulkMessage = this.isDeactivating ? "bulkDeactivatedMessage" : "bulkActivatedMessage";
      response.data.forEach((entry) => {
        const error = entry.error !== "" ? entry.error : this.i18nService.t(bulkMessage);
        this.statuses.set(entry.id, error);
      });
      this.done = true;
    } catch (e) {
      this.error = e.message;
    }

    this.loading = false;
    this.modalRef.close();
  }

  protected async performBulkUserAction() {
    const request = new OrganizationUserBulkRequest(this.users.map((user) => user.id));
    if (this.isDeactivating) {
      return await this.apiService.deactivateManyOrganizationUsers(this.organizationId, request);
    } else {
      return await this.apiService.activateManyOrganizationUsers(this.organizationId, request);
    }
  }
}
