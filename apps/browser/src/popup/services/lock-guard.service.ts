import { Injectable } from "@angular/core";

import { LockGuard as BaseLockGuardService } from "jslib-angular/guards/lock.guard";

@Injectable()
export class LockGuardService extends BaseLockGuardService {
  protected homepage = "tabs/current";
}
