import { Subject, combineLatestWith, map, distinctUntilChanged, shareReplay } from "rxjs";
import { Jsonify } from "type-fest";

import {
  AccountInfo,
  InternalAccountService,
  accountInfoEqual,
} from "../../auth/abstractions/account.service";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import {
  ACCOUNT_ACCOUNTS,
  ACCOUNT_ACTIVE_ACCOUNT_ID,
  GlobalState,
  GlobalStateProvider,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { AuthenticationStatus } from "../enums/authentication-status";

export function AccountsDeserializer(
  accounts: Jsonify<Record<UserId, AccountInfo> | null>
): Record<UserId, AccountInfo> {
  if (accounts == null) {
    return {};
  }

  return accounts;
}

export class AccountServiceImplementation implements InternalAccountService {
  private lock = new Subject<UserId>();
  private logout = new Subject<UserId>();
  private accountsState: GlobalState<Record<UserId, AccountInfo>>;
  private activeAccountIdState: GlobalState<UserId | undefined>;

  accounts$;
  activeAccount$;
  accountLock$ = this.lock.asObservable();
  accountLogout$ = this.logout.asObservable();

  constructor(
    private messagingService: MessagingService,
    private logService: LogService,
    private globalStateProvider: GlobalStateProvider
  ) {
    this.accountsState = this.globalStateProvider.get(ACCOUNT_ACCOUNTS);
    this.activeAccountIdState = this.globalStateProvider.get(ACCOUNT_ACTIVE_ACCOUNT_ID);

    this.accounts$ = this.accountsState.state$.pipe(
      map((accounts) => (accounts == null ? {} : accounts))
    );
    this.activeAccount$ = this.activeAccountIdState.state$.pipe(
      combineLatestWith(this.accounts$),
      map(([id, accounts]) => (id ? { id, ...accounts[id] } : undefined)),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  addAccount(userId: UserId, accountData: AccountInfo): void {
    this.accountsState.update((accounts) => {
      accounts ||= {};
      accounts[userId] = accountData;
      return accounts;
    });
  }

  setAccountName(userId: UserId, name: string): void {
    this.setAccountInfo(userId, { name });
  }

  setAccountEmail(userId: UserId, email: string): void {
    this.setAccountInfo(userId, { email });
  }

  setAccountStatus(userId: UserId, status: AuthenticationStatus): void {
    this.setAccountInfo(userId, { status });

    if (status === AuthenticationStatus.LoggedOut) {
      this.logout.next(userId);
    } else if (status === AuthenticationStatus.Locked) {
      this.lock.next(userId);
    }
  }

  switchAccount(userId: UserId) {
    this.activeAccountIdState.update(
      (_, accounts) => {
        if (userId == null) {
          // indicates no account is active
          return undefined;
        }

        if (accounts?.[userId] == null) {
          throw new Error("Account does not exist");
        }
        return userId;
      },
      {
        combineLatestWith: this.accounts$,
      }
    );
  }

  // TODO: update to use our own account status settings. Requires inverting direction of state service accounts flow
  async delete(): Promise<void> {
    try {
      this.messagingService?.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }

  private setAccountInfo(userId: UserId, update: Partial<AccountInfo>) {
    function newAccountInfo(oldAccountInfo: AccountInfo): AccountInfo {
      return { ...oldAccountInfo, ...update };
    }
    this.accountsState.update(
      (accounts) => {
        accounts[userId] = newAccountInfo(accounts[userId]);
        return accounts;
      },
      {
        // Avoid unnecessary updates
        // TODO: Faster comparison, maybe include a hash on the objects?
        shouldUpdate: (accounts) => {
          if (accounts?.[userId] == null) {
            throw new Error("Account does not exist");
          }

          return !accountInfoEqual(accounts[userId], newAccountInfo(accounts[userId]));
        },
      }
    );
  }
}
