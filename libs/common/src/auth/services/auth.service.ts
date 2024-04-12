import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";

import { ApiService } from "../../abstractions/api.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import { StateService } from "../../platform/abstractions/state.service";
import { KeySuffixOptions } from "../../platform/enums";
import { UserId } from "../../types/guid";
import { AccountService } from "../abstractions/account.service";
import { AuthService as AuthServiceAbstraction } from "../abstractions/auth.service";
import { TokenService } from "../abstractions/token.service";
import { AuthenticationStatus } from "../enums/authentication-status";

export class AuthService implements AuthServiceAbstraction {
  activeAccountStatus$: Observable<AuthenticationStatus>;
  authStatuses$: Observable<Record<UserId, AuthenticationStatus>>;

  constructor(
    protected accountService: AccountService,
    protected messagingService: MessagingService,
    protected cryptoService: CryptoService,
    protected apiService: ApiService,
    protected stateService: StateService,
    private tokenService: TokenService,
  ) {
    this.activeAccountStatus$ = this.accountService.activeAccount$.pipe(
      map((account) => account?.id),
      switchMap((userId) => {
        return this.authStatusFor$(userId);
      }),
    );

    this.authStatuses$ = this.accountService.accounts$.pipe(
      map((accounts) => Object.keys(accounts) as UserId[]),
      switchMap((entries) =>
        combineLatest(
          entries.map((userId) =>
            this.authStatusFor$(userId).pipe(map((status) => ({ userId, status }))),
          ),
        ),
      ),
      map((statuses) => {
        return statuses.reduce(
          (acc, { userId, status }) => {
            acc[userId] = status;
            return acc;
          },
          {} as Record<UserId, AuthenticationStatus>,
        );
      }),
    );
  }

  authStatusFor$(userId: UserId): Observable<AuthenticationStatus> {
    if (userId == null) {
      return of(AuthenticationStatus.LoggedOut);
    }

    return combineLatest([
      this.cryptoService.getInMemoryUserKeyFor$(userId),
      this.tokenService.hasAccessToken$(userId),
    ]).pipe(
      map(([userKey, hasAccessToken]) => {
        if (!hasAccessToken) {
          return AuthenticationStatus.LoggedOut;
        }

        if (!userKey) {
          return AuthenticationStatus.Locked;
        }

        return AuthenticationStatus.Unlocked;
      }),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  async getAuthStatus(userId?: string): Promise<AuthenticationStatus> {
    // If we don't have an access token or userId, we're logged out
    const isAuthenticated = await this.stateService.getIsAuthenticated({ userId: userId });
    if (!isAuthenticated) {
      return AuthenticationStatus.LoggedOut;
    }

    // If we don't have a user key in memory, we're locked
    if (!(await this.cryptoService.hasUserKeyInMemory(userId))) {
      // Check if the user has vault timeout set to never and verify that
      // they've never unlocked their vault
      const neverLock =
        (await this.cryptoService.hasUserKeyStored(KeySuffixOptions.Auto, userId)) &&
        !(await this.stateService.getEverBeenUnlocked({ userId: userId }));

      if (neverLock) {
        // Attempt to get the key from storage and set it in memory
        const userKey = await this.cryptoService.getUserKeyFromStorage(
          KeySuffixOptions.Auto,
          userId,
        );
        await this.cryptoService.setUserKey(userKey, userId);
      }
    }

    // We do another check here in case setting the auto key failed
    const hasKeyInMemory = await this.cryptoService.hasUserKeyInMemory(userId);
    if (!hasKeyInMemory) {
      return AuthenticationStatus.Locked;
    }

    return AuthenticationStatus.Unlocked;
  }

  logOut(callback: () => void) {
    callback();
    this.messagingService.send("loggedOut");
  }
}
