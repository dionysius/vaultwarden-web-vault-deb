import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";

import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Injectable()
export class SMGuard implements CanActivate {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    return this.platformUtilsService.isDev();
  }
}
