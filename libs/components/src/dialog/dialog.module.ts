import { DialogModule as CdkDialogModule } from "@angular/cdk/dialog";
import { NgModule } from "@angular/core";

import { SharedModule } from "../shared";

import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";
import { DialogCloseDirective } from "./directives/dialog-close.directive";
import { DialogTitleContainerDirective } from "./directives/dialog-title-container.directive";
import { SimpleDialogComponent } from "./simple-dialog/simple-dialog.component";

@NgModule({
  imports: [SharedModule, CdkDialogModule],
  declarations: [
    DialogCloseDirective,
    DialogComponent,
    DialogTitleContainerDirective,
    SimpleDialogComponent,
  ],
  exports: [CdkDialogModule, DialogComponent, SimpleDialogComponent],
  providers: [DialogService],
})
export class DialogModule {}
