import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

export interface OrgUpgradeDialogData {
  orgId: string;
  orgCanManageBilling: boolean;
  dialogBodyText: string;
}

@Component({
  selector: "app-org-upgrade-dialog",
  templateUrl: "org-upgrade-dialog.component.html",
})
export class OrgUpgradeDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: OrgUpgradeDialogData
  ) {}
}
