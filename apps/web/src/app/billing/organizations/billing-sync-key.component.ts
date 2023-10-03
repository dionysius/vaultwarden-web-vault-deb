import { Component } from "@angular/core";

import { ModalRef } from "@bitwarden/angular/components/modal/modal.ref";
import { ModalConfig } from "@bitwarden/angular/services/modal.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationConnectionType } from "@bitwarden/common/admin-console/enums";
import { OrganizationConnectionRequest } from "@bitwarden/common/admin-console/models/request/organization-connection.request";
import { OrganizationConnectionResponse } from "@bitwarden/common/admin-console/models/response/organization-connection.response";
import { BillingSyncConfigApi } from "@bitwarden/common/billing/models/api/billing-sync-config.api";
import { BillingSyncConfigRequest } from "@bitwarden/common/billing/models/request/billing-sync-config.request";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";

export interface BillingSyncKeyModalData {
  entityId: string;
  existingConnectionId: string;
  billingSyncKey: string;
  setParentConnection: (connection: OrganizationConnectionResponse<BillingSyncConfigApi>) => void;
}

@Component({
  templateUrl: "billing-sync-key.component.html",
})
export class BillingSyncKeyComponent {
  entityId: string;
  existingConnectionId: string;
  billingSyncKey: string;
  setParentConnection: (connection: OrganizationConnectionResponse<BillingSyncConfigApi>) => void;

  formPromise: Promise<OrganizationConnectionResponse<BillingSyncConfigApi>> | Promise<void>;

  constructor(
    private apiService: ApiService,
    private logService: LogService,
    protected modalRef: ModalRef,
    config: ModalConfig<BillingSyncKeyModalData>
  ) {
    this.entityId = config.data.entityId;
    this.existingConnectionId = config.data.existingConnectionId;
    this.billingSyncKey = config.data.billingSyncKey;
    this.setParentConnection = config.data.setParentConnection;
  }

  async submit() {
    try {
      const request = new OrganizationConnectionRequest(
        this.entityId,
        OrganizationConnectionType.CloudBillingSync,
        true,
        new BillingSyncConfigRequest(this.billingSyncKey)
      );
      if (this.existingConnectionId == null) {
        this.formPromise = this.apiService.createOrganizationConnection(
          request,
          BillingSyncConfigApi
        );
      } else {
        this.formPromise = this.apiService.updateOrganizationConnection(
          request,
          BillingSyncConfigApi,
          this.existingConnectionId
        );
      }
      const response = (await this
        .formPromise) as OrganizationConnectionResponse<BillingSyncConfigApi>;
      this.existingConnectionId = response?.id;
      this.billingSyncKey = response?.config?.billingSyncKey;
      this.setParentConnection(response);
      this.modalRef.close();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async deleteConnection() {
    this.formPromise = this.apiService.deleteOrganizationConnection(this.existingConnectionId);
    await this.formPromise;
    this.setParentConnection(null);
    this.modalRef.close();
  }
}
