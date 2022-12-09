import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";

@Injectable()
export class SMGuard implements CanActivate {
  async canActivate(route: ActivatedRouteSnapshot) {
    // TODO: Verify org
    return true;
  }
}
