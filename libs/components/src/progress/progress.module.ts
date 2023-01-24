import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { ProgressComponent } from "./progress.component";

@NgModule({
  imports: [CommonModule],
  exports: [ProgressComponent],
  declarations: [ProgressComponent],
})
export class ProgressModule {}
