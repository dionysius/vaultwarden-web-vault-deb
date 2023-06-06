import { Component } from "@angular/core";
import { Observable } from "rxjs";

import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { ServerConfig } from "@bitwarden/common/platform/abstractions/config/server-config";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";

import { BrowserApi } from "../../platform/browser/browser-api";

@Component({
  selector: "app-about",
  templateUrl: "about.component.html",
})
export class AboutComponent {
  serverConfig$: Observable<ServerConfig>;

  year = new Date().getFullYear();
  version = BrowserApi.getApplicationVersion();
  isCloud: boolean;

  constructor(configService: ConfigServiceAbstraction, environmentService: EnvironmentService) {
    this.serverConfig$ = configService.serverConfig$;
    this.isCloud = environmentService.isCloud();
  }
}
