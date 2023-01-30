import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { AccessListComponent } from "./access/access-list.component";
import { AccessTokenComponent } from "./access/access-tokens.component";
import { AccessTokenCreateDialogComponent } from "./access/dialogs/access-token-create-dialog.component";
import { AccessTokenDialogComponent } from "./access/dialogs/access-token-dialog.component";
import { ExpirationOptionsComponent } from "./access/dialogs/expiration-options.component";
import { ServiceAccountDialogComponent } from "./dialog/service-account-dialog.component";
import { ServiceAccountComponent } from "./service-account.component";
import { ServiceAccountsListComponent } from "./service-accounts-list.component";
import { ServiceAccountsRoutingModule } from "./service-accounts-routing.module";
import { ServiceAccountsComponent } from "./service-accounts.component";

@NgModule({
  imports: [SecretsManagerSharedModule, ServiceAccountsRoutingModule, BreadcrumbsModule],
  declarations: [
    AccessListComponent,
    ExpirationOptionsComponent,
    AccessTokenComponent,
    AccessTokenCreateDialogComponent,
    AccessTokenDialogComponent,
    ServiceAccountComponent,
    ServiceAccountDialogComponent,
    ServiceAccountsComponent,
    ServiceAccountsListComponent,
  ],
  providers: [],
})
export class ServiceAccountsModule {}
