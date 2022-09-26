import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { TabHeaderComponent } from "./shared/tab-header.component";
import { TabListContainerDirective } from "./shared/tab-list-container.directive";
import { TabListItemDirective } from "./shared/tab-list-item.directive";
import { TabBodyComponent } from "./tab-group/tab-body.component";
import { TabGroupComponent } from "./tab-group/tab-group.component";
import { TabLabelDirective } from "./tab-group/tab-label.directive";
import { TabComponent } from "./tab-group/tab.component";
import { TabLinkComponent } from "./tab-nav-bar/tab-link.component";
import { TabNavBarComponent } from "./tab-nav-bar/tab-nav-bar.component";

@NgModule({
  imports: [CommonModule, RouterModule, PortalModule],
  exports: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabNavBarComponent,
    TabLinkComponent,
  ],
  declarations: [
    TabGroupComponent,
    TabComponent,
    TabLabelDirective,
    TabListContainerDirective,
    TabListItemDirective,
    TabHeaderComponent,
    TabNavBarComponent,
    TabLinkComponent,
    TabBodyComponent,
  ],
})
export class TabsModule {}
