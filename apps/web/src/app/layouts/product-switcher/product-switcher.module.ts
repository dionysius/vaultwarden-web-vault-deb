import { A11yModule } from "@angular/cdk/a11y";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { I18nPipe } from "@bitwarden/angular/pipes/i18n.pipe";

import { SharedModule } from "../../shared";

import { ProductSwitcherContentComponent } from "./product-switcher-content.component";
import { ProductSwitcherComponent } from "./product-switcher.component";

@NgModule({
  imports: [SharedModule, A11yModule, RouterModule],
  declarations: [ProductSwitcherComponent, ProductSwitcherContentComponent],
  exports: [ProductSwitcherComponent],
  providers: [I18nPipe],
})
export class ProductSwitcherModule {}
