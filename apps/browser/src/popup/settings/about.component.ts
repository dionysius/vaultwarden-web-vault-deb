import { Component } from "@angular/core";
import { Observable } from "rxjs";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { ServerConfig } from "@bitwarden/common/abstractions/config/server-config";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";

import { BrowserApi } from "../../browser/browserApi";

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
