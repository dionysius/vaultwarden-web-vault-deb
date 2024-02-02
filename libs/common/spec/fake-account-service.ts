import { mock } from "jest-mock-extended";
import { Observable, ReplaySubject } from "rxjs";

import { AccountInfo, AccountService } from "../src/auth/abstractions/account.service";
import { AuthenticationStatus } from "../src/auth/enums/authentication-status";
import { UserId } from "../src/types/guid";

export function mockAccountServiceWith(
  userId: UserId,
  info: Partial<AccountInfo> = {},
): FakeAccountService {
  const fullInfo: AccountInfo = {
    ...info,
    ...{
      name: "name",
      email: "email",
      status: AuthenticationStatus.Locked,
    },
  };
  const service = new FakeAccountService({ [userId]: fullInfo });
  service.activeAccountSubject.next({ id: userId, ...fullInfo });
  return service;
}

export class FakeAccountService implements AccountService {
  mock = mock<AccountService>();
  // eslint-disable-next-line rxjs/no-exposed-subjects -- test class
  accountsSubject = new ReplaySubject<Record<UserId, AccountInfo>>(1);
  // eslint-disable-next-line rxjs/no-exposed-subjects -- test class
  activeAccountSubject = new ReplaySubject<{ id: UserId } & AccountInfo>(1);
  private _activeUserId: UserId;
  get activeUserId() {
    return this._activeUserId;
  }
  get accounts$() {
    return this.accountsSubject.asObservable();
  }
  get activeAccount$() {
    return this.activeAccountSubject.asObservable();
  }
  accountLock$: Observable<UserId>;
  accountLogout$: Observable<UserId>;

  constructor(initialData: Record<UserId, AccountInfo>) {
    this.accountsSubject.next(initialData);
    this.activeAccountSubject.subscribe((data) => (this._activeUserId = data?.id));
    this.activeAccountSubject.next(null);
  }

  async addAccount(userId: UserId, accountData: AccountInfo): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.addAccount(userId, accountData);
  }

  async setAccountName(userId: UserId, name: string): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.setAccountName(userId, name);
  }

  async setAccountEmail(userId: UserId, email: string): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.setAccountEmail(userId, email);
  }

  async setAccountStatus(userId: UserId, status: AuthenticationStatus): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.setAccountStatus(userId, status);
  }

  async switchAccount(userId: UserId): Promise<void> {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.mock.switchAccount(userId);
  }
}
