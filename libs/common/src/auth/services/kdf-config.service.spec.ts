import { FakeAccountService, FakeStateProvider, mockAccountServiceWith } from "../../../spec";
import {
  ARGON2_ITERATIONS,
  ARGON2_MEMORY,
  ARGON2_PARALLELISM,
  PBKDF2_ITERATIONS,
} from "../../platform/enums/kdf-type.enum";
import { Utils } from "../../platform/misc/utils";
import { UserId } from "../../types/guid";
import { Argon2KdfConfig, PBKDF2KdfConfig } from "../models/domain/kdf-config";

import { KdfConfigService } from "./kdf-config.service";

describe("KdfConfigService", () => {
  let sutKdfConfigService: KdfConfigService;

  let fakeStateProvider: FakeStateProvider;
  let fakeAccountService: FakeAccountService;
  const mockUserId = Utils.newGuid() as UserId;

  beforeEach(() => {
    jest.clearAllMocks();

    fakeAccountService = mockAccountServiceWith(mockUserId);
    fakeStateProvider = new FakeStateProvider(fakeAccountService);
    sutKdfConfigService = new KdfConfigService(fakeStateProvider);
  });

  it("setKdfConfig(): should set the KDF config", async () => {
    const kdfConfig: PBKDF2KdfConfig = new PBKDF2KdfConfig(600_000);
    await sutKdfConfigService.setKdfConfig(mockUserId, kdfConfig);
    await expect(sutKdfConfigService.getKdfConfig()).resolves.toEqual(kdfConfig);
  });

  it("setKdfConfig(): should get the KDF config", async () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(3, 64, 4);
    await sutKdfConfigService.setKdfConfig(mockUserId, kdfConfig);
    await expect(sutKdfConfigService.getKdfConfig()).resolves.toEqual(kdfConfig);
  });

  it("setKdfConfig(): should throw error KDF cannot be null", async () => {
    const kdfConfig: Argon2KdfConfig = null;
    try {
      await sutKdfConfigService.setKdfConfig(mockUserId, kdfConfig);
    } catch (e) {
      expect(e).toEqual(new Error("kdfConfig cannot be null"));
    }
  });

  it("setKdfConfig(): should throw error userId cannot be null", async () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(3, 64, 4);
    try {
      await sutKdfConfigService.setKdfConfig(null, kdfConfig);
    } catch (e) {
      expect(e).toEqual(new Error("userId cannot be null"));
    }
  });

  it("getKdfConfig(): should throw error KdfConfig for active user account state is null", async () => {
    try {
      await sutKdfConfigService.getKdfConfig();
    } catch (e) {
      expect(e).toEqual(new Error("KdfConfig for active user account state is null"));
    }
  });

  it("validateKdfConfig(): should validate the PBKDF2 KDF config", () => {
    const kdfConfig: PBKDF2KdfConfig = new PBKDF2KdfConfig(600_000);
    expect(() => kdfConfig.validateKdfConfig()).not.toThrow();
  });

  it("validateKdfConfig(): should validate the Argon2id KDF config", () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(3, 64, 4);
    expect(() => kdfConfig.validateKdfConfig()).not.toThrow();
  });

  it("validateKdfConfig(): should throw an error for invalid PBKDF2 iterations", () => {
    const kdfConfig: PBKDF2KdfConfig = new PBKDF2KdfConfig(100);
    expect(() => kdfConfig.validateKdfConfig()).toThrow(
      `PBKDF2 iterations must be between ${PBKDF2_ITERATIONS.min} and ${PBKDF2_ITERATIONS.max}`,
    );
  });

  it("validateKdfConfig(): should throw an error for invalid Argon2 iterations", () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(11, 64, 4);
    expect(() => kdfConfig.validateKdfConfig()).toThrow(
      `Argon2 iterations must be between ${ARGON2_ITERATIONS.min} and ${ARGON2_ITERATIONS.max}`,
    );
  });

  it("validateKdfConfig(): should throw an error for invalid Argon2 memory", () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(3, 1025, 4);
    expect(() => kdfConfig.validateKdfConfig()).toThrow(
      `Argon2 memory must be between ${ARGON2_MEMORY.min}mb and ${ARGON2_MEMORY.max}mb`,
    );
  });

  it("validateKdfConfig(): should throw an error for invalid Argon2 parallelism", () => {
    const kdfConfig: Argon2KdfConfig = new Argon2KdfConfig(3, 64, 17);
    expect(() => kdfConfig.validateKdfConfig()).toThrow(
      `Argon2 parallelism must be between ${ARGON2_PARALLELISM.min} and ${ARGON2_PARALLELISM.max}`,
    );
  });
});
