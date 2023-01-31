import { NgModule } from "@angular/core";

import { SharedModule } from "../../../../app/shared";

import { BulkDeleteDialogComponent } from "./bulk-delete-dialog/bulk-delete-dialog.component";
import { BulkMoveDialogComponent } from "./bulk-move-dialog/bulk-move-dialog.component";
import { BulkRestoreDialogComponent } from "./bulk-restore-dialog/bulk-restore-dialog.component";
import { BulkShareDialogComponent } from "./bulk-share-dialog/bulk-share-dialog.component";

@NgModule({
  imports: [SharedModule],
  declarations: [
    BulkDeleteDialogComponent,
    BulkMoveDialogComponent,
    BulkRestoreDialogComponent,
    BulkShareDialogComponent,
  ],
  exports: [
    BulkDeleteDialogComponent,
    BulkMoveDialogComponent,
    BulkRestoreDialogComponent,
    BulkShareDialogComponent,
  ],
})
export class BulkDialogsModule {}
