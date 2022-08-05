import { DialogModule as CdkDialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DialogCloseDirective } from "./dialog-close.directive";
import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";
import { SimpleDialogComponent } from "./simple-dialog/simple-dialog.component";

@NgModule({
  imports: [CommonModule, CdkDialogModule],
  declarations: [DialogCloseDirective, DialogComponent, SimpleDialogComponent],
  exports: [CdkDialogModule, DialogComponent, SimpleDialogComponent],
  providers: [DialogService],
})
export class DialogModule {}
