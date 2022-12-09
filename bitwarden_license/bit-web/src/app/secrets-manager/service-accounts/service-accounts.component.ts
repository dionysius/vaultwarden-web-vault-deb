import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatestWith, Observable, startWith, switchMap } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { ServiceAccountView } from "../models/view/service-account.view";

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
    private serviceAccountService: ServiceAccountService
  ) {}

  ngOnInit() {
    this.serviceAccounts$ = this.serviceAccountService.serviceAccount$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(async ([_, params]) => {
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

  private async getServiceAccounts(): Promise<ServiceAccountView[]> {
    return await this.serviceAccountService.getServiceAccounts(this.organizationId);
  }
}
