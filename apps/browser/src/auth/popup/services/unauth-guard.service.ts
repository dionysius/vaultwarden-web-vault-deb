import { UnauthGuard as BaseUnauthGuardService } from "@bitwarden/angular/auth/guards";

export class UnauthGuardService extends BaseUnauthGuardService {
  protected homepage = "tabs/current";
}
