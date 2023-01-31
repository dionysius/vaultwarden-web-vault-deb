import { Component, OnInit } from "@angular/core";
import { map, Observable } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import {
  canAccessAdmin,
  isNotProviderUser,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ProviderService } from "@bitwarden/common/abstractions/provider.service";
import { TokenService } from "@bitwarden/common/abstractions/token.service";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { Provider } from "@bitwarden/common/models/domain/provider";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

@Component({
  selector: "app-navbar",
  templateUrl: "navbar.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class NavbarComponent implements OnInit {
  selfHosted = false;
  name: string;
  email: string;
  providers: Provider[] = [];
  userId: string;
  organizations$: Observable<Organization[]>;

  constructor(
    private messagingService: MessagingService,
    private platformUtilsService: PlatformUtilsService,
    private tokenService: TokenService,
    private providerService: ProviderService,
    private syncService: SyncService,
    private organizationService: OrganizationService,
    private i18nService: I18nService
  ) {
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    this.name = await this.tokenService.getName();
    this.email = await this.tokenService.getEmail();
    this.userId = await this.tokenService.getUserId();
    if (this.name == null || this.name.trim() === "") {
      this.name = this.email;
    }

    // Ensure providers and organizations are loaded
    if ((await this.syncService.getLastSync()) == null) {
      await this.syncService.fullSync(false);
    }
    this.providers = await this.providerService.getAll();

    this.organizations$ = this.organizationService.organizations$.pipe(
      map((orgs) => orgs.filter(isNotProviderUser)),
      canAccessAdmin(this.i18nService)
    );
  }

  lock() {
    this.messagingService.send("lockVault");
  }

  logOut() {
    this.messagingService.send("logout");
  }
}
