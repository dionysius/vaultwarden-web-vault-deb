import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable, startWith, switchMap } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { ServiceAccountView } from "../models/view/service-account.view";
import { AccessPolicyService } from "../shared/access-policies/access-policy.service";

import {
  ServiceAccountDeleteDialogComponent,
  ServiceAccountDeleteOperation,
} from "./dialog/service-account-delete-dialog.component";
import {
  ServiceAccountDialogComponent,
  ServiceAccountOperation,
} from "./dialog/service-account-dialog.component";
import { ServiceAccountService } from "./service-account.service";

@Component({
  selector: "sm-service-accounts",
  templateUrl: "./service-accounts.component.html",
})
export class ServiceAccountsComponent implements OnInit {
  serviceAccounts$: Observable<ServiceAccountView[]>;

  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private accessPolicyService: AccessPolicyService,
    private serviceAccountService: ServiceAccountService
  ) {}

  ngOnInit() {
    this.serviceAccounts$ = combineLatest([
      this.route.params,
      this.serviceAccountService.serviceAccount$.pipe(startWith(null)),
      this.accessPolicyService.serviceAccountAccessPolicyChanges$.pipe(startWith(null)),
    ]).pipe(
      switchMap(async ([params]) => {
        this.organizationId = params.organizationId;
        return await this.getServiceAccounts();
      })
    );
  }

  openNewServiceAccountDialog() {
    this.dialogService.open<unknown, ServiceAccountOperation>(ServiceAccountDialogComponent, {
      data: {
        organizationId: this.organizationId,
      },
    });
  }

  openDeleteDialog(event: ServiceAccountView[]) {
    this.dialogService.open<unknown, ServiceAccountDeleteOperation>(
      ServiceAccountDeleteDialogComponent,
      {
        data: {
          serviceAccounts: event,
        },
      }
    );
  }

  private async getServiceAccounts(): Promise<ServiceAccountView[]> {
    return await this.serviceAccountService.getServiceAccounts(this.organizationId);
  }
}
