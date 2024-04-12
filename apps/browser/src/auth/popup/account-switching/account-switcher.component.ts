import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, firstValueFrom, map, switchMap, takeUntil } from "rxjs";

import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { VaultTimeoutAction } from "@bitwarden/common/enums/vault-timeout-action.enum";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { DialogService } from "@bitwarden/components";

import { AccountSwitcherService } from "./services/account-switcher.service";

@Component({
  templateUrl: "account-switcher.component.html",
})
export class AccountSwitcherComponent implements OnInit, OnDestroy {
  readonly lockedStatus = AuthenticationStatus.Locked;
  private destroy$ = new Subject<void>();

  loading = false;
  activeUserCanLock = false;

  constructor(
    private accountSwitcherService: AccountSwitcherService,
    private accountService: AccountService,
    private vaultTimeoutService: VaultTimeoutService,
    private messagingService: MessagingService,
    private dialogService: DialogService,
    private location: Location,
    private router: Router,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private authService: AuthService,
  ) {}

  get accountLimit() {
    return this.accountSwitcherService.ACCOUNT_LIMIT;
  }

  get specialAddAccountId() {
    return this.accountSwitcherService.SPECIAL_ADD_ACCOUNT_ID;
  }

  readonly availableAccounts$ = this.accountSwitcherService.availableAccounts$;
  readonly currentAccount$ = this.accountService.activeAccount$.pipe(
    switchMap((a) =>
      a == null
        ? null
        : this.authService.activeAccountStatus$.pipe(map((s) => ({ ...a, status: s }))),
    ),
  );

  async ngOnInit() {
    const availableVaultTimeoutActions = await firstValueFrom(
      this.vaultTimeoutSettingsService.availableVaultTimeoutActions$(),
    );
    this.activeUserCanLock = availableVaultTimeoutActions.includes(VaultTimeoutAction.Lock);
  }

  back() {
    this.location.back();
  }

  async lock(userId?: string) {
    this.loading = true;
    await this.vaultTimeoutService.lock(userId ? userId : null);
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate(["lock"]);
  }

  async lockAll() {
    this.loading = true;
    this.availableAccounts$
      .pipe(
        map((accounts) =>
          accounts
            .filter((account) => account.id !== this.specialAddAccountId)
            .sort((a, b) => (a.isActive ? -1 : b.isActive ? 1 : 0)) // Log out of the active account first
            .map((account) => account.id),
        ),
        switchMap(async (accountIds) => {
          if (accountIds.length === 0) {
            return;
          }

          // Must lock active (first) account first, then order doesn't matter
          await this.vaultTimeoutService.lock(accountIds.shift());
          await Promise.all(accountIds.map((id) => this.vaultTimeoutService.lock(id)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.router.navigate(["lock"]));
  }

  async logOut() {
    this.loading = true;
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "logOut" },
      content: { key: "logOutConfirmation" },
      type: "info",
    });

    if (confirmed) {
      this.messagingService.send("logout");
    }

    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate(["home"]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
