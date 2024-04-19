import { mock } from "jest-mock-extended";

import { FakeAccountService, mockAccountServiceWith } from "../../../spec";
import { CsprngArray } from "../../types/csprng";
import { UserId } from "../../types/guid";
import { UserKey } from "../../types/key";
import { LogService } from "../abstractions/log.service";
import { KeySuffixOptions } from "../enums";
import { Utils } from "../misc/utils";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";

import { CryptoService } from "./crypto.service";
import { UserKeyInitService } from "./user-key-init.service";

describe("UserKeyInitService", () => {
  let userKeyInitService: UserKeyInitService;

  const mockUserId = Utils.newGuid() as UserId;

  const accountService: FakeAccountService = mockAccountServiceWith(mockUserId);

  const cryptoService = mock<CryptoService>();
  const logService = mock<LogService>();

  beforeEach(() => {
    userKeyInitService = new UserKeyInitService(accountService, cryptoService, logService);
  });

  describe("listenForActiveUserChangesToSetUserKey()", () => {
    it("calls setUserKeyInMemoryIfAutoUserKeySet if there is an active user", () => {
      // Arrange
      accountService.activeAccountSubject.next({
        id: mockUserId,
        name: "name",
        email: "email",
      });

      (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet = jest.fn();

      // Act

      const subscription = userKeyInitService.listenForActiveUserChangesToSetUserKey();

      // Assert

      expect(subscription).not.toBeFalsy();

      expect((userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it("calls setUserKeyInMemoryIfAutoUserKeySet if there is an active user and tracks subsequent emissions", () => {
      // Arrange
      accountService.activeAccountSubject.next({
        id: mockUserId,
        name: "name",
        email: "email",
      });

      const mockUser2Id = Utils.newGuid() as UserId;

      jest
        .spyOn(userKeyInitService as any, "setUserKeyInMemoryIfAutoUserKeySet")
        .mockImplementation(() => Promise.resolve());

      // Act

      const subscription = userKeyInitService.listenForActiveUserChangesToSetUserKey();

      accountService.activeAccountSubject.next({
        id: mockUser2Id,
        name: "name",
        email: "email",
      });

      // Assert

      expect(subscription).not.toBeFalsy();

      expect((userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet).toHaveBeenCalledTimes(
        2,
      );

      expect(
        (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet,
      ).toHaveBeenNthCalledWith(1, mockUserId);
      expect(
        (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet,
      ).toHaveBeenNthCalledWith(2, mockUser2Id);

      subscription.unsubscribe();
    });

    it("does not call setUserKeyInMemoryIfAutoUserKeySet if there is not an active user", () => {
      // Arrange
      accountService.activeAccountSubject.next(null);

      (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet = jest.fn();

      // Act

      const subscription = userKeyInitService.listenForActiveUserChangesToSetUserKey();

      // Assert

      expect(subscription).not.toBeFalsy();

      expect(
        (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet,
      ).not.toHaveBeenCalledWith(mockUserId);
    });
  });

  describe("setUserKeyInMemoryIfAutoUserKeySet", () => {
    it("does nothing if the userId is null", async () => {
      // Act
      await (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet(null);

      // Assert
      expect(cryptoService.getUserKeyFromStorage).not.toHaveBeenCalled();
      expect(cryptoService.setUserKey).not.toHaveBeenCalled();
    });

    it("does nothing if the autoUserKey is null", async () => {
      // Arrange
      const userId = mockUserId;

      cryptoService.getUserKeyFromStorage.mockResolvedValue(null);

      // Act
      await (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet(userId);

      // Assert
      expect(cryptoService.getUserKeyFromStorage).toHaveBeenCalledWith(
        KeySuffixOptions.Auto,
        userId,
      );
      expect(cryptoService.setUserKey).not.toHaveBeenCalled();
    });

    it("sets the user key in memory if the autoUserKey is not null", async () => {
      // Arrange
      const userId = mockUserId;

      const mockRandomBytes = new Uint8Array(64) as CsprngArray;
      const mockAutoUserKey: UserKey = new SymmetricCryptoKey(mockRandomBytes) as UserKey;

      cryptoService.getUserKeyFromStorage.mockResolvedValue(mockAutoUserKey);

      // Act
      await (userKeyInitService as any).setUserKeyInMemoryIfAutoUserKeySet(userId);

      // Assert
      expect(cryptoService.getUserKeyFromStorage).toHaveBeenCalledWith(
        KeySuffixOptions.Auto,
        userId,
      );
      expect(cryptoService.setUserKey).toHaveBeenCalledWith(mockAutoUserKey, userId);
    });
  });
});
