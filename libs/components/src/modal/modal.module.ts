import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ModalSimpleComponent } from "./modal-simple.component";
import { ModalComponent } from "./modal.component";

@NgModule({
  imports: [CommonModule],
  exports: [ModalComponent, ModalSimpleComponent],
  declarations: [ModalComponent, ModalSimpleComponent],
})
export class ModalModule {}
