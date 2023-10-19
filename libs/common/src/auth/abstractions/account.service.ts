import { Observable } from "rxjs";

import { UserId } from "../../types/guid";
import { AuthenticationStatus } from "../enums/authentication-status";

export type AccountInfo = {
  status: AuthenticationStatus;
  email: string;
  name: string | undefined;
};

export abstract class AccountService {
  accounts$: Observable<Record<UserId, AccountInfo>>;
  activeAccount$: Observable<{ id: UserId | undefined } & AccountInfo>;
  accountLock$: Observable<UserId>;
  accountLogout$: Observable<UserId>;
  /**
   * Updates the `accounts$` observable with the new account data.
   * @param userId
   * @param accountData
   */
  abstract addAccount(userId: UserId, accountData: AccountInfo): void;
  /**
   * updates the `accounts$` observable with the new preferred name for the account.
   * @param userId
   * @param name
   */
  abstract setAccountName(userId: UserId, name: string): void;
  /**
   * updates the `accounts$` observable with the new email for the account.
   * @param userId
   * @param email
   */
  abstract setAccountEmail(userId: UserId, email: string): void;
  /**
   * Updates the `accounts$` observable with the new account status.
   * Also emits the `accountLock$` or `accountLogout$` observable if the status is `Locked` or `LoggedOut` respectively.
   * @param userId
   * @param status
   */
  abstract setAccountStatus(userId: UserId, status: AuthenticationStatus): void;
  /**
   * Updates the `activeAccount$` observable with the new active account.
   * @param userId
   */
  abstract switchAccount(userId: UserId): void;
}

export abstract class InternalAccountService extends AccountService {
  abstract delete(): void;
}
