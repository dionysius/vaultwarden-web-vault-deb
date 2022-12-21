import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { WebI18nKey } from "@bitwarden/web-vault/app/core/web-i18n.service.implementation";

export interface BulkStatusDetails {
  title: WebI18nKey;
  subTitle: WebI18nKey;
  columnTitle: WebI18nKey;
  message: WebI18nKey;
  details: BulkOperationStatus[];
}

export class BulkOperationStatus {
  id: string;
  name: string;
  errorMessage?: string;
}

@Component({
  selector: "sm-bulk-status-dialog",
  templateUrl: "./bulk-status-dialog.component.html",
})
export class BulkStatusDialogComponent implements OnInit {
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: BulkStatusDetails) {}

  ngOnInit(): void {
    // TODO remove null checks once strictNullChecks in TypeScript is turned on.
    if (
      !this.data.title ||
      !this.data.subTitle ||
      !this.data.columnTitle ||
      !this.data.message ||
      !(this.data.details?.length >= 1)
    ) {
      this.dialogRef.close();
      throw new Error(
        "The bulk status dialog was not called with the appropriate operation values."
      );
    }
  }
}
