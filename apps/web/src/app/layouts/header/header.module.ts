import { NgModule } from "@angular/core";

import { DynamicAvatarComponent } from "../../components/dynamic-avatar.component";
import { SharedModule } from "../../shared";
import { ProductSwitcherModule } from "../product-switcher/product-switcher.module";

import { WebHeaderComponent } from "./web-header.component";

@NgModule({
  imports: [SharedModule, DynamicAvatarComponent, ProductSwitcherModule],
  declarations: [WebHeaderComponent],
  exports: [WebHeaderComponent],
})
export class HeaderModule {}
