import { DIALOG_DATA, DialogConfig } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { OrganizationUserStatusType } from "@bitwarden/common/admin-console/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DialogService } from "@bitwarden/components";

import { BulkUserDetails } from "./bulk-status.component";

type BulkRemoveDialogData = {
  organizationId: string;
  users: BulkUserDetails[];
};

@Component({
  selector: "app-bulk-remove",
  templateUrl: "bulk-remove.component.html",
})
export class BulkRemoveComponent {
  organizationId: string;
  users: BulkUserDetails[];

  statuses: Map<string, string> = new Map();

  loading = false;
  done = false;
  error: string;
  showNoMasterPasswordWarning = false;

  constructor(
    @Inject(DIALOG_DATA) protected data: BulkRemoveDialogData,
    protected apiService: ApiService,
    protected i18nService: I18nService,
    private organizationUserService: OrganizationUserService,
  ) {
    this.organizationId = data.organizationId;
    this.users = data.users;
    this.showNoMasterPasswordWarning = this.users.some(
      (u) => u.status > OrganizationUserStatusType.Invited && u.hasMasterPassword === false,
    );
  }

  submit = async () => {
    this.loading = true;
    try {
      const response = await this.deleteUsers();

      response.data.forEach((entry) => {
        const error = entry.error !== "" ? entry.error : this.i18nService.t("bulkRemovedMessage");
        this.statuses.set(entry.id, error);
      });
      this.done = true;
    } catch (e) {
      this.error = e.message;
    }

    this.loading = false;
  };

  protected async deleteUsers() {
    return await this.organizationUserService.deleteManyOrganizationUsers(
      this.organizationId,
      this.users.map((user) => user.id),
    );
  }

  protected get removeUsersWarning() {
    return this.i18nService.t("removeOrgUsersConfirmation");
  }

  static open(dialogService: DialogService, config: DialogConfig<BulkRemoveDialogData>) {
    return dialogService.open(BulkRemoveComponent, config);
  }
}
