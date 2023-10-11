import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { WebauthnLoginService } from "../../core";
import { WebauthnCredentialView } from "../../core/views/webauth-credential.view";

import { openCreateCredentialDialog } from "./create-credential-dialog/create-credential-dialog.component";
import { openDeleteCredentialDialogComponent } from "./delete-credential-dialog/delete-credential-dialog.component";

@Component({
  selector: "app-webauthn-login-settings",
  templateUrl: "webauthn-login-settings.component.html",
  host: {
    "aria-live": "polite",
  },
})
export class WebauthnLoginSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected readonly MaxCredentialCount = WebauthnLoginService.MaxCredentialCount;

  protected credentials?: WebauthnCredentialView[];
  protected loading = true;

  constructor(
    private webauthnService: WebauthnLoginService,
    private dialogService: DialogService
  ) {}

  @HostBinding("attr.aria-busy")
  get ariaBusy() {
    return this.loading ? "true" : "false";
  }

  get hasCredentials() {
    return this.credentials && this.credentials.length > 0;
  }

  get hasData() {
    return this.credentials !== undefined;
  }

  get limitReached() {
    return this.credentials?.length >= this.MaxCredentialCount;
  }

  ngOnInit(): void {
    this.webauthnService
      .getCredentials$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((credentials) => (this.credentials = credentials));

    this.webauthnService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected createCredential() {
    openCreateCredentialDialog(this.dialogService, {});
  }

  protected deleteCredential(credentialId: string) {
    openDeleteCredentialDialogComponent(this.dialogService, { data: { credentialId } });
  }
}
