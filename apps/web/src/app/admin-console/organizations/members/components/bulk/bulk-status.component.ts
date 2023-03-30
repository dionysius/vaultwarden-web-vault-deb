import { Component } from "@angular/core";

import { OrganizationUserStatusType } from "@bitwarden/common/admin-console/enums/organization-user-status-type";
import { ProviderUserStatusType } from "@bitwarden/common/admin-console/enums/provider-user-status-type";

export interface BulkUserDetails {
  id: string;
  name: string;
  email: string;
  status: OrganizationUserStatusType | ProviderUserStatusType;
}

type BulkStatusEntry = {
  user: BulkUserDetails;
  error: boolean;
  message: string;
};

@Component({
  selector: "app-bulk-status",
  templateUrl: "bulk-status.component.html",
})
export class BulkStatusComponent {
  users: BulkStatusEntry[];
  loading = false;
}
