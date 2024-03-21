import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { combineLatest, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { ButtonModule, DialogModule } from "@bitwarden/components";

import { BrowserApi } from "../../platform/browser/browser-api";

@Component({
  templateUrl: "about.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, DialogModule, ButtonModule],
})
export class AboutComponent {
  protected year = new Date().getFullYear();
  protected version = BrowserApi.getApplicationVersion();

  protected data$ = combineLatest([
    this.configService.serverConfig$,
    this.environmentService.environment$.pipe(map((env) => env.isCloud())),
  ]).pipe(map(([serverConfig, isCloud]) => ({ serverConfig, isCloud })));

  constructor(
    private configService: ConfigServiceAbstraction,
    private environmentService: EnvironmentService,
  ) {}
}
