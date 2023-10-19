import { MockProxy, mock } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { trackEmissions } from "../../../spec/utils";
import { LogService } from "../../platform/abstractions/log.service";
import { MessagingService } from "../../platform/abstractions/messaging.service";
import { UserId } from "../../types/guid";
import { AccountInfo } from "../abstractions/account.service";
import { AuthenticationStatus } from "../enums/authentication-status";

import { AccountServiceImplementation } from "./account.service";

describe("accountService", () => {
  let messagingService: MockProxy<MessagingService>;
  let logService: MockProxy<LogService>;
  let sut: AccountServiceImplementation;
  const userId = "userId" as UserId;
  function userInfo(status: AuthenticationStatus): AccountInfo {
    return { status, email: "email", name: "name" };
  }

  beforeEach(() => {
    messagingService = mock<MessagingService>();
    logService = mock<LogService>();

    sut = new AccountServiceImplementation(messagingService, logService);
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
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
      sut.switchAccount(userId);

      expect(emissions).toEqual([
        undefined, // initial value
        { id: userId, ...userInfo(AuthenticationStatus.Unlocked) },
      ]);
    });

    it("should remember the last emitted value", async () => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
      sut.switchAccount(userId);

      expect(await firstValueFrom(sut.activeAccount$)).toEqual({
        id: userId,
        ...userInfo(AuthenticationStatus.Unlocked),
      });
    });
  });

  describe("addAccount", () => {
    it("should emit the new account", () => {
      const emissions = trackEmissions(sut.accounts$);
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));

      expect(emissions).toEqual([
        {}, // initial value
        { [userId]: userInfo(AuthenticationStatus.Unlocked) },
      ]);
    });
  });

  describe("setAccountName", () => {
    beforeEach(() => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
    });

    it("should emit the updated account", () => {
      const emissions = trackEmissions(sut.accounts$);
      sut.setAccountName(userId, "new name");

      expect(emissions).toEqual([
        { [userId]: { ...userInfo(AuthenticationStatus.Unlocked), name: "name" } },
        { [userId]: { ...userInfo(AuthenticationStatus.Unlocked), name: "new name" } },
      ]);
    });
  });

  describe("setAccountEmail", () => {
    beforeEach(() => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
    });

    it("should emit the updated account", () => {
      const emissions = trackEmissions(sut.accounts$);
      sut.setAccountEmail(userId, "new email");

      expect(emissions).toEqual([
        { [userId]: { ...userInfo(AuthenticationStatus.Unlocked), email: "email" } },
        { [userId]: { ...userInfo(AuthenticationStatus.Unlocked), email: "new email" } },
      ]);
    });
  });

  describe("setAccountStatus", () => {
    beforeEach(() => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
    });

    it("should not emit if the status is the same", async () => {
      const emissions = trackEmissions(sut.accounts$);
      sut.setAccountStatus(userId, AuthenticationStatus.Unlocked);
      sut.setAccountStatus(userId, AuthenticationStatus.Unlocked);

      expect(emissions).toEqual([{ userId: userInfo(AuthenticationStatus.Unlocked) }]);
    });

    it("should maintain an accounts cache", async () => {
      expect(await firstValueFrom(sut.accounts$)).toEqual({
        [userId]: userInfo(AuthenticationStatus.Unlocked),
      });
    });

    it("should emit if the status is different", () => {
      const emissions = trackEmissions(sut.accounts$);
      sut.setAccountStatus(userId, AuthenticationStatus.Locked);

      expect(emissions).toEqual([
        { userId: userInfo(AuthenticationStatus.Unlocked) }, // initial value from beforeEach
        { userId: userInfo(AuthenticationStatus.Locked) },
      ]);
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
    let emissions: { id: string; status: AuthenticationStatus }[];

    beforeEach(() => {
      emissions = [];
      sut.activeAccount$.subscribe((value) => emissions.push(value));
    });

    it("should emit undefined if no account is provided", () => {
      sut.switchAccount(undefined);

      expect(emissions).toEqual([undefined]);
    });

    it("should emit the active account and status", () => {
      sut.addAccount(userId, userInfo(AuthenticationStatus.Unlocked));
      sut.switchAccount(userId);
      sut.setAccountStatus(userId, AuthenticationStatus.Locked);
      sut.switchAccount(undefined);
      sut.switchAccount(undefined);
      expect(emissions).toEqual([
        undefined, // initial value
        { id: userId, ...userInfo(AuthenticationStatus.Unlocked) },
        { id: userId, ...userInfo(AuthenticationStatus.Locked) },
      ]);
    });

    it("should throw if switched to an unknown account", () => {
      expect(() => sut.switchAccount(userId)).toThrowError("Account does not exist");
    });
  });
});
