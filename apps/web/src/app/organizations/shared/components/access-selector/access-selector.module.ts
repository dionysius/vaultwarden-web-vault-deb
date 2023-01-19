import { NgModule } from "@angular/core";

import { SharedModule } from "../../../../shared/shared.module";

import { AccessSelectorComponent } from "./access-selector.component";
import { UserTypePipe } from "./user-type.pipe";

@NgModule({
  imports: [SharedModule],
  declarations: [AccessSelectorComponent, UserTypePipe],
  exports: [AccessSelectorComponent],
})
export class AccessSelectorModule {}
