import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { Response } from "../models/response";
import { TemplateResponse } from "../models/response/template.response";

export class StatusCommand {
  constructor(
    private envService: EnvironmentService,
    private syncService: SyncService,
    private stateService: StateService,
    private authService: AuthService
  ) {}

  async run(): Promise<Response> {
    try {
      const baseUrl = this.baseUrl();
      const status = await this.status();
      const lastSync = await this.syncService.getLastSync();
      const userId = await this.stateService.getUserId();
      const email = await this.stateService.getEmail();

      return Response.success(
        new TemplateResponse({
          serverUrl: baseUrl,
          lastSync: lastSync,
          userEmail: email,
          userId: userId,
          status: status,
        })
      );
    } catch (e) {
      return Response.error(e);
    }
  }

  private baseUrl(): string {
    return this.envService.getUrls().base;
  }

  private async status(): Promise<"unauthenticated" | "locked" | "unlocked"> {
    const authStatus = await this.authService.getAuthStatus();
    if (authStatus === AuthenticationStatus.Unlocked) {
      return "unlocked";
    } else if (authStatus === AuthenticationStatus.Locked) {
      return "locked";
    } else {
      return "unauthenticated";
    }
  }
}
