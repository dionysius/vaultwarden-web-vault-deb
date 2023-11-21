import { MockProxy, mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { trackEmissions } from "../../../spec/utils";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import {
  ACCOUNT_ACCOUNTS,
  ACCOUNT_ACTIVE_ACCOUNT_ID,
  GlobalState,
  GlobalStateProvider,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { AccountInfo } from "../abstractions/account.service";
import { AuthenticationStatus } from "../enums/authentication-status";

import { AccountServiceImplementation } from "./account.service";

describe("accountService", () => {
  let messagingService: MockProxy<MessagingService>;
  let logService: MockProxy<LogService>;
  let globalStateProvider: MockProxy<GlobalStateProvider>;
  let accountsState: MockProxy<GlobalState<Record<UserId, AccountInfo>>>;
  let accountsSubject: BehaviorSubject<Record<UserId, AccountInfo>>;
  let activeAccountIdState: MockProxy<GlobalState<UserId>>;
  let activeAccountIdSubject: BehaviorSubject<UserId>;
  let sut: AccountServiceImplementation;
  const userId = "userId" as UserId;
  function userInfo(status: AuthenticationStatus): AccountInfo {
    return { status, email: "email", name: "name" };
  }

  beforeEach(() => {
    messagingService = mock();
    logService = mock();
    globalStateProvider = mock();
    accountsState = mock();
    activeAccountIdState = mock();

    accountsSubject = new BehaviorSubject<Record<UserId, AccountInfo>>(null);
    accountsState.state$ = accountsSubject.asObservable();
    activeAccountIdSubject = new BehaviorSubject<UserId>(null);
    activeAccountIdState.state$ = activeAccountIdSubject.asObservable();

    globalStateProvider.get.mockImplementation((keyDefinition) => {
      switch (keyDefinition) {
        case ACCOUNT_ACCOUNTS:
          return accountsState;
        case ACCOUNT_ACTIVE_ACCOUNT_ID:
          return activeAccountIdState;
        default:
          throw new Error("Unknown key definition");
      }
    });

    sut = new AccountServiceImplementation(messagingService, logService, globalStateProvider);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("activeAccount$", () => {
    it("should emit undefined if no account is active", () => {
      const emissions = trackEmissions(sut.activeAccount$);

      expect(emissions).toEqual([undefined]);
    });

    it("should emit the active account and status", async () => {
      const emissions = trackEmissions(sut.activeAccount$);
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
      activeAccountIdSubject.next(userId);

      expect(emissions).toEqual([
        undefined, // initial value
        { id: userId, ...userInfo(AuthenticationStatus.Unlocked) },
      ]);
    });

    it("should update the status if the account status changes", async () => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
      activeAccountIdSubject.next(userId);
      const emissions = trackEmissions(sut.activeAccount$);
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Locked) });

      expect(emissions).toEqual([
        { id: userId, ...userInfo(AuthenticationStatus.Unlocked) },
        { id: userId, ...userInfo(AuthenticationStatus.Locked) },
      ]);
    });

    it("should remember the last emitted value", async () => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
      activeAccountIdSubject.next(userId);

      expect(await firstValueFrom(sut.activeAccount$)).toEqual({
        id: userId,
        ...userInfo(AuthenticationStatus.Unlocked),
      });
    });
  });

  describe("accounts$", () => {
    it("should maintain an accounts cache", async () => {
      expect(await firstValueFrom(sut.accounts$)).toEqual({});
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
      expect(await firstValueFrom(sut.accounts$)).toEqual({
        [userId]: userInfo(AuthenticationStatus.Unlocked),
      });
    });
  });

  describe("addAccount", () => {
    it("should emit the new account", () => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));

      expect(accountsState.update).toHaveBeenCalledTimes(1);
      const callback = accountsState.update.mock.calls[0][0];
      expect(callback({}, null)).toEqual({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
    });
  });

  describe("setAccountName", () => {
    beforeEach(() => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
    });

    it("should update the account", async () => {
      sut.setAccountName(userId, "new name");

      const callback = accountsState.update.mock.calls[0][0];

      expect(callback(accountsSubject.value, null)).toEqual({
        [userId]: { ...userInfo(AuthenticationStatus.Unlocked), name: "new name" },
      });
    });

    it("should not update if the name is the same", async () => {
      sut.setAccountName(userId, "name");

      const callback = accountsState.update.mock.calls[0][1].shouldUpdate;

      expect(callback(accountsSubject.value, null)).toBe(false);
    });
  });

  describe("setAccountEmail", () => {
    beforeEach(() => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
    });

    it("should update the account", () => {
      sut.setAccountEmail(userId, "new email");

      const callback = accountsState.update.mock.calls[0][0];

      expect(callback(accountsSubject.value, null)).toEqual({
        [userId]: { ...userInfo(AuthenticationStatus.Unlocked), email: "new email" },
      });
    });

    it("should not update if the email is the same", () => {
      sut.setAccountEmail(userId, "email");

      const callback = accountsState.update.mock.calls[0][1].shouldUpdate;

      expect(callback(accountsSubject.value, null)).toBe(false);
    });
  });

  describe("setAccountStatus", () => {
    beforeEach(() => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
    });

    it("should update the account", () => {
      sut.setAccountStatus(userId, AuthenticationStatus.Locked);

      const callback = accountsState.update.mock.calls[0][0];

      expect(callback(accountsSubject.value, null)).toEqual({
        [userId]: {
          ...userInfo(AuthenticationStatus.Unlocked),
          status: AuthenticationStatus.Locked,
        },
      });
    });

    it("should not update if the status is the same", () => {
      sut.setAccountStatus(userId, AuthenticationStatus.Unlocked);

      const callback = accountsState.update.mock.calls[0][1].shouldUpdate;

      expect(callback(accountsSubject.value, null)).toBe(false);
    });

    it("should emit logout if the status is logged out", () => {
      const emissions = trackEmissions(sut.accountLogout$);
      sut.setAccountStatus(userId, AuthenticationStatus.LoggedOut);

      expect(emissions).toEqual([userId]);
    });

    it("should emit lock if the status is locked", () => {
      const emissions = trackEmissions(sut.accountLock$);
      sut.setAccountStatus(userId, AuthenticationStatus.Locked);

      expect(emissions).toEqual([userId]);
    });
  });

  describe("switchAccount", () => {
    beforeEach(() => {
      accountsSubject.next({ [userId]: userInfo(AuthenticationStatus.Unlocked) });
    });

    it("should emit undefined if no account is provided", () => {
      sut.switchAccount(null);
      const callback = activeAccountIdState.update.mock.calls[0][0];
      expect(callback(userId, accountsSubject.value)).toBeUndefined();
    });

    it("should throw if the account does not exist", () => {
      sut.switchAccount("unknown" as UserId);
      const callback = activeAccountIdState.update.mock.calls[0][0];
      expect(() => callback(userId, accountsSubject.value)).toThrowError("Account does not exist");
    });
  });
});
