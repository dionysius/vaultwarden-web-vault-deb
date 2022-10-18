import { Component, OnInit } from "@angular/core";

import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { BreachAccountResponse } from "@bitwarden/common/models/response/breach-account.response";

@Component({
  selector: "app-breach-report",
  templateUrl: "breach-report.component.html",
})
export class BreachReportComponent implements OnInit {
  error = false;
  username: string;
  checkedUsername: string;
  breachedAccounts: BreachAccountResponse[] = [];
  formPromise: Promise<BreachAccountResponse[]>;

  constructor(private auditService: AuditService, private stateService: StateService) {}

  async ngOnInit() {
    this.username = await this.stateService.getEmail();
  }

  async submit() {
    this.error = false;
    this.username = this.username.toLowerCase();
    try {
      this.formPromise = this.auditService.breachedAccounts(this.username);
      this.breachedAccounts = await this.formPromise;
    } catch {
      this.error = true;
    }
    this.checkedUsername = this.username;
  }
}
