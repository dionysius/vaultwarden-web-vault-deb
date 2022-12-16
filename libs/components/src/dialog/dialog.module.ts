import { DialogModule as CdkDialogModule } from "@angular/cdk/dialog";
import { NgModule } from "@angular/core";

import { IconButtonModule } from "../icon-button";
import { SharedModule } from "../shared";

import { DialogService } from "./dialog.service";
import { DialogComponent } from "./dialog/dialog.component";
import { DialogCloseDirective } from "./directives/dialog-close.directive";
import { DialogTitleContainerDirective } from "./directives/dialog-title-container.directive";
import { IconDirective, SimpleDialogComponent } from "./simple-dialog/simple-dialog.component";

@NgModule({
  imports: [SharedModule, IconButtonModule, CdkDialogModule],
  declarations: [
    DialogCloseDirective,
    DialogTitleContainerDirective,
    DialogComponent,
    SimpleDialogComponent,
    IconDirective,
  ],
  exports: [
    CdkDialogModule,
    DialogComponent,
    SimpleDialogComponent,
    DialogCloseDirective,
    IconDirective,
  ],
  providers: [DialogService],
})
export class DialogModule {}
