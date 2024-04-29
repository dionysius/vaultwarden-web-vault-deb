import { mock } from "jest-mock-extended";

import { CsprngArray } from "../../types/csprng";
import { UserId } from "../../types/guid";
import { UserKey } from "../../types/key";
import { KeySuffixOptions } from "../enums";
import { Utils } from "../misc/utils";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";

import { CryptoService } from "./crypto.service";
import { UserAutoUnlockKeyService } from "./user-auto-unlock-key.service";

describe("UserAutoUnlockKeyService", () => {
  let userAutoUnlockKeyService: UserAutoUnlockKeyService;

  const mockUserId = Utils.newGuid() as UserId;

  const cryptoService = mock<CryptoService>();

  beforeEach(() => {
    userAutoUnlockKeyService = new UserAutoUnlockKeyService(cryptoService);
  });

  describe("setUserKeyInMemoryIfAutoUserKeySet", () => {
    it("does nothing if the userId is null", async () => {
      // Act
      await (userAutoUnlockKeyService as any).setUserKeyInMemoryIfAutoUserKeySet(null);

      // Assert
      expect(cryptoService.getUserKeyFromStorage).not.toHaveBeenCalled();
      expect(cryptoService.setUserKey).not.toHaveBeenCalled();
    });

    it("does nothing if the autoUserKey is null", async () => {
      // Arrange
      const userId = mockUserId;

      cryptoService.getUserKeyFromStorage.mockResolvedValue(null);

      // Act
      await (userAutoUnlockKeyService as any).setUserKeyInMemoryIfAutoUserKeySet(userId);

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
      await (userAutoUnlockKeyService as any).setUserKeyInMemoryIfAutoUserKeySet(userId);

      // Assert
      expect(cryptoService.getUserKeyFromStorage).toHaveBeenCalledWith(
        KeySuffixOptions.Auto,
        userId,
      );
      expect(cryptoService.setUserKey).toHaveBeenCalledWith(mockAutoUserKey, userId);
    });
  });
});
