import { Injectable } from "@angular/core";

import { UnauthGuard as BaseUnauthGuardService } from "jslib-angular/guards/unauth.guard";

@Injectable()
export class UnauthGuardService extends BaseUnauthGuardService {
  protected homepage = "tabs/current";
}
