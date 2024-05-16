import { Component, OnInit } from "@angular/core";
import { firstValueFrom, map } from "rxjs";

import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
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

  constructor(
    private auditService: AuditService,
    private accountService: AccountService,
  ) {}

  async ngOnInit() {
    this.username = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a) => a?.email)),
    );
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
