import { matches, mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, timeout } from "rxjs";

import { AccountInfo, AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { UserId } from "@bitwarden/common/types/guid";

import { AccountSwitcherService } from "./account-switcher.service";

describe("AccountSwitcherService", () => {
  const accountsSubject = new BehaviorSubject<Record<UserId, AccountInfo>>(null);
  const activeAccountSubject = new BehaviorSubject<{ id: UserId } & AccountInfo>(null);

  const accountService = mock<AccountService>();
  const stateService = mock<StateService>();
  const messagingService = mock<MessagingService>();

  let accountSwitcherService: AccountSwitcherService;

  beforeEach(() => {
    jest.resetAllMocks();
    accountService.accounts$ = accountsSubject;
    accountService.activeAccount$ = activeAccountSubject;
    accountSwitcherService = new AccountSwitcherService(
      accountService,
      stateService,
      messagingService,
    );
  });

  describe("accountOptions$", () => {
    it("should return all accounts and an add account option when accounts are less than 5", async () => {
      const user1AccountInfo: AccountInfo = {
        name: "Test User 1",
        email: "test1@email.com",
        status: AuthenticationStatus.Unlocked,
      };

      accountsSubject.next({
        "1": user1AccountInfo,
      } as Record<UserId, AccountInfo>);

      activeAccountSubject.next(Object.assign(user1AccountInfo, { id: "1" as UserId }));

      const accounts = await firstValueFrom(
        accountSwitcherService.accountOptions$.pipe(timeout(20)),
      );
      expect(accounts).toHaveLength(2);
      expect(accounts[0].id).toBe("1");
      expect(accounts[0].isSelected).toBeTruthy();

      expect(accounts[1].id).toBe("addAccount");
      expect(accounts[1].isSelected).toBeFalsy();
    });

    it.each([5, 6])(
      "should return only accounts if there are %i accounts",
      async (numberOfAccounts) => {
        const seedAccounts: Record<UserId, AccountInfo> = {};
        for (let i = 0; i < numberOfAccounts; i++) {
          seedAccounts[`${i}` as UserId] = {
            email: `test${i}@email.com`,
            name: "Test User ${i}",
            status: AuthenticationStatus.Unlocked,
          };
        }
        accountsSubject.next(seedAccounts);
        activeAccountSubject.next(
          Object.assign(seedAccounts["1" as UserId], { id: "1" as UserId }),
        );

        const accounts = await firstValueFrom(accountSwitcherService.accountOptions$);

        expect(accounts).toHaveLength(numberOfAccounts);
        accounts.forEach((account) => {
          expect(account.id).not.toBe("addAccount");
        });
      },
    );
  });

  describe("selectAccount", () => {
    it("initiates an add account logic when add account is selected", async () => {
      await accountSwitcherService.selectAccount("addAccount");

      expect(stateService.setActiveUser).toBeCalledWith(null);
      expect(stateService.setRememberedEmail).toBeCalledWith(null);

      expect(accountService.switchAccount).not.toBeCalled();
    });

    it("initiates an account switch with an account id", async () => {
      await accountSwitcherService.selectAccount("1");

      expect(accountService.switchAccount).toBeCalledWith("1");
      expect(messagingService.send).toBeCalledWith(
        "switchAccount",
        matches((payload) => {
          return payload.userId === "1";
        }),
      );
    });
  });
});
