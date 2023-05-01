import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AccessPolicyService } from "../access-policy.service";
import { AccessSelectorComponent, AccessSelectorRowView } from "../access-selector.component";

export interface AccessRemovalDetails {
  title: string;
  message: string;
  operation: "update" | "delete";
  type: "project" | "service-account";
  returnRoute: string[];
  policy: AccessSelectorRowView;
}

@Component({
  templateUrl: "./access-removal-dialog.component.html",
})
export class AccessRemovalDialogComponent implements OnInit {
  constructor(
    public dialogRef: DialogRef,
    private router: Router,
    private accessPolicyService: AccessPolicyService,
    @Inject(DIALOG_DATA) public data: AccessRemovalDetails
  ) {}

  ngOnInit(): void {
    // TODO remove null checks once strictNullChecks in TypeScript is turned on.
    if (
      !this.data.message ||
      !this.data.title ||
      !this.data.operation ||
      !this.data.returnRoute ||
      !this.data.policy
    ) {
      this.dialogRef.close();
      throw new Error(
        "The access removal dialog was not called with the appropriate operation values."
      );
    }
  }

  removeAccess = async () => {
    await this.router.navigate(this.data.returnRoute);
    if (this.data.operation === "delete") {
      await this.accessPolicyService.deleteAccessPolicy(this.data.policy.accessPolicyId);
    } else if (this.data.operation == "update") {
      await this.accessPolicyService.updateAccessPolicy(
        AccessSelectorComponent.getBaseAccessPolicyView(this.data.policy)
      );
      this.refreshPolicyChanges();
    }
    this.dialogRef.close();
  };

  cancel = () => {
    this.refreshPolicyChanges();
    this.dialogRef.close();
  };

  private refreshPolicyChanges() {
    if (this.data.type == "project") {
      this.accessPolicyService.refreshProjectAccessPolicyChanges();
    } else if (this.data.type == "service-account") {
      this.accessPolicyService.refreshServiceAccountAccessPolicyChanges();
    }
  }
}
