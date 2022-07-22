import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";

import { OssModule } from "src/app/oss.module";

import { LayoutComponent } from "./layout/layout.component";
import { NavigationComponent } from "./layout/navigation.component";
import { SecretsManagerRoutingModule } from "./sm-routing.module";
import { SMGuard } from "./sm.guard";

@NgModule({
  imports: [CommonModule, FormsModule, OssModule, JslibModule, SecretsManagerRoutingModule],
  declarations: [LayoutComponent, NavigationComponent],
  providers: [SMGuard],
})
export class SecretsManagerModule {}
