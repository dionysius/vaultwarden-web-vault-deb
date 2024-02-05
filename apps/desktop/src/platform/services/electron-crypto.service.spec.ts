import { FakeStateProvider } from "@bitwarden/common/../spec/fake-state-provider";
import { mock } from "jest-mock-extended";

import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { BiometricStateService } from "@bitwarden/common/platform/biometrics/biometric-state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { makeEncString, makeStaticByteArray } from "@bitwarden/common/spec";
import { CsprngArray } from "@bitwarden/common/types/csprng";
import { UserId } from "@bitwarden/common/types/guid";
import { UserKey } from "@bitwarden/common/types/key";

import {
  FakeAccountService,
  mockAccountServiceWith,
} from "../../../../../libs/common/spec/fake-account-service";

import { DefaultElectronCryptoService } from "./electron-crypto.service";
import { ElectronStateService } from "./electron-state.service.abstraction";

describe("electronCryptoService", () => {
  let sut: DefaultElectronCryptoService;

  const cryptoFunctionService = mock<CryptoFunctionService>();
  const encryptService = mock<EncryptService>();
  const platformUtilService = mock<PlatformUtilsService>();
  const logService = mock<LogService>();
  const stateService = mock<ElectronStateService>();
  let accountService: FakeAccountService;
  let stateProvider: FakeStateProvider;
  const biometricStateService = mock<BiometricStateService>();

  const mockUserId = "mock user id" as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith("userId" as UserId);
    stateProvider = new FakeStateProvider(accountService);

    sut = new DefaultElectronCryptoService(
      cryptoFunctionService,
      encryptService,
      platformUtilService,
      logService,
      stateService,
      accountService,
      stateProvider,
      biometricStateService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("setBiometricClientKeyHalf", () => {
    const userKey = new SymmetricCryptoKey(makeStaticByteArray(64, 1)) as UserKey;
    const keyBytes = makeStaticByteArray(32, 2) as CsprngArray;
    const encKeyHalf = makeEncString(Utils.fromBufferToUtf8(keyBytes));

    beforeEach(() => {
      sut.getUserKey = jest.fn().mockResolvedValue(userKey);
      cryptoFunctionService.randomBytes.mockResolvedValue(keyBytes);
      encryptService.encrypt.mockResolvedValue(encKeyHalf);
    });

    it("sets a biometric client key half for the currently active user", async () => {
      await sut.setBiometricClientKeyHalf();

      expect(biometricStateService.setEncryptedClientKeyHalf).toHaveBeenCalledWith(encKeyHalf);
    });

    it("should create the key from csprng bytes", async () => {
      await sut.setBiometricClientKeyHalf();

      expect(cryptoFunctionService.randomBytes).toHaveBeenCalledWith(32);
    });

    it("should encrypt the key half with the user key", async () => {
      await sut.setBiometricClientKeyHalf();

      expect(encryptService.encrypt).toHaveBeenCalledWith(expect.any(String), userKey);
    });
  });

  describe("removeBiometricClientKeyHalf", () => {
    it("removes the biometric client key half for the currently active user", async () => {
      await sut.removeBiometricClientKeyHalf();

      expect(biometricStateService.setEncryptedClientKeyHalf).toHaveBeenCalledWith(null);
    });
  });

  describe("setUserKey", () => {
    let mockUserKey: UserKey;

    beforeEach(() => {
      const mockRandomBytes = new Uint8Array(64) as CsprngArray;
      mockUserKey = new SymmetricCryptoKey(mockRandomBytes) as UserKey;
    });

    describe("Biometric Key refresh", () => {
      it("sets an Biometric key if getBiometricUnlock is true and the platform supports secure storage", async () => {
        stateService.getBiometricUnlock.mockResolvedValue(true);
        platformUtilService.supportsSecureStorage.mockReturnValue(true);
        biometricStateService.getRequirePasswordOnStart.mockResolvedValue(true);

        await sut.setUserKey(mockUserKey, mockUserId);

        expect(stateService.setUserKeyBiometric).toHaveBeenCalledWith(
          expect.objectContaining({ key: expect.any(String), clientEncKeyHalf: null }),
          {
            userId: mockUserId,
          },
        );
      });

      it("clears the Biometric key if getBiometricUnlock is false or the platform does not support secure storage", async () => {
        stateService.getBiometricUnlock.mockResolvedValue(true);
        platformUtilService.supportsSecureStorage.mockReturnValue(false);

        await sut.setUserKey(mockUserKey, mockUserId);

        expect(stateService.setUserKeyBiometric).toHaveBeenCalledWith(null, {
          userId: mockUserId,
        });
      });

      it("clears the old deprecated Biometric key whenever a User Key is set", async () => {
        await sut.setUserKey(mockUserKey, mockUserId);

        expect(stateService.setCryptoMasterKeyBiometric).toHaveBeenCalledWith(null, {
          userId: mockUserId,
        });
      });
    });
  });
});
