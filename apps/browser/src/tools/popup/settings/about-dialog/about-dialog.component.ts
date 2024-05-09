import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Observable, combineLatest, defer, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ButtonModule, DialogModule } from "@bitwarden/components";

@Component({
  templateUrl: "about-dialog.component.html",
  standalone: true,
  imports: [CommonModule, JslibModule, DialogModule, ButtonModule],
})
export class AboutDialogComponent {
  protected year = new Date().getFullYear();
  protected version$: Observable<string>;

  protected data$ = combineLatest([
    this.configService.serverConfig$,
    this.environmentService.environment$.pipe(map((env) => env.isCloud())),
  ]).pipe(map(([serverConfig, isCloud]) => ({ serverConfig, isCloud })));

  constructor(
    private configService: ConfigService,
    private environmentService: EnvironmentService,
    private platformUtilsService: PlatformUtilsService,
  ) {
    this.version$ = defer(() => this.platformUtilsService.getApplicationVersion());
  }
}
