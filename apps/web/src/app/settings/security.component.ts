import { Component } from "@angular/core";

import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";

@Component({
  selector: "app-security",
  templateUrl: "security.component.html",
})
export class SecurityComponent {
  showChangePassword = true;

  constructor(private keyConnectorService: KeyConnectorService) {}

  async ngOnInit() {
    this.showChangePassword = !(await this.keyConnectorService.getUsesKeyConnector());
  }
}
