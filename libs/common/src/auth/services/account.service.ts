import {
  BehaviorSubject,
  Subject,
  combineLatestWith,
  map,
  distinctUntilChanged,
  shareReplay,
} from "rxjs";

import { AccountInfo, InternalAccountService } from "../../auth/abstractions/account.service";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import { UserId } from "../../types/guid";
import { AuthenticationStatus } from "../enums/authentication-status";

export class AccountServiceImplementation implements InternalAccountService {
  private accounts = new BehaviorSubject<Record<UserId, AccountInfo>>({});
  private activeAccountId = new BehaviorSubject<UserId | undefined>(undefined);
  private lock = new Subject<UserId>();
  private logout = new Subject<UserId>();

  accounts$ = this.accounts.asObservable();
  activeAccount$ = this.activeAccountId.pipe(
    combineLatestWith(this.accounts$),
    map(([id, accounts]) => (id ? { id, ...accounts[id] } : undefined)),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: false })
  );
  accountLock$ = this.lock.asObservable();
  accountLogout$ = this.logout.asObservable();
  constructor(private messagingService: MessagingService, private logService: LogService) {}

  addAccount(userId: UserId, accountData: AccountInfo): void {
    this.accounts.value[userId] = accountData;
    this.accounts.next(this.accounts.value);
  }

  setAccountName(userId: UserId, name: string): void {
    this.setAccountInfo(userId, { ...this.accounts.value[userId], name });
  }

  setAccountEmail(userId: UserId, email: string): void {
    this.setAccountInfo(userId, { ...this.accounts.value[userId], email });
  }

  setAccountStatus(userId: UserId, status: AuthenticationStatus): void {
    this.setAccountInfo(userId, { ...this.accounts.value[userId], status });

    if (status === AuthenticationStatus.LoggedOut) {
      this.logout.next(userId);
    } else if (status === AuthenticationStatus.Locked) {
      this.lock.next(userId);
    }
  }

  switchAccount(userId: UserId) {
    if (userId == null) {
      // indicates no account is active
      this.activeAccountId.next(undefined);
      return;
    }

    if (this.accounts.value[userId] == null) {
      throw new Error("Account does not exist");
    }
    this.activeAccountId.next(userId);
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

  private setAccountInfo(userId: UserId, accountInfo: AccountInfo) {
    if (this.accounts.value[userId] == null) {
      throw new Error("Account does not exist");
    }

    // Avoid unnecessary updates
    // TODO: Faster comparison, maybe include a hash on the objects?
    if (JSON.stringify(this.accounts.value[userId]) === JSON.stringify(accountInfo)) {
      return;
    }

    this.accounts.value[userId] = accountInfo;
    this.accounts.next(this.accounts.value);
  }
}
