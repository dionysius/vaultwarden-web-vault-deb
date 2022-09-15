import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconButtonModule } from "../icon-button";
import { SharedModule } from "../shared/shared.module";

import { BannerComponent } from "./banner.component";

@NgModule({
  imports: [CommonModule, SharedModule, IconButtonModule],
  exports: [BannerComponent],
  declarations: [BannerComponent],
})
export class BannerModule {}
