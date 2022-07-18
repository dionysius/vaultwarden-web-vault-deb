import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TabGroupComponent } from "./tab-group.component";
import { TabItemComponent } from "./tab-item.component";

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [TabGroupComponent, TabItemComponent],
  declarations: [TabGroupComponent, TabItemComponent],
})
export class TabsModule {}
