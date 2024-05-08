import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, map, of } from "rxjs";

import {
  PinServiceAbstraction,
  FakeUserDecryptionOptions as UserDecryptionOptions,
  UserDecryptionOptionsServiceAbstraction,
} from "@bitwarden/auth/common";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { UserId } from "@bitwarden/common/types/guid";

import { FakeAccountService, mockAccountServiceWith } from "../../../spec";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { Policy } from "../../admin-console/models/domain/policy";
import { TokenService } from "../../auth/abstractions/token.service";
import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { StateService } from "../../platform/abstractions/state.service";
import { BiometricStateService } from "../../platform/biometrics/biometric-state.service";

import { VaultTimeoutSettingsService } from "./vault-timeout-settings.service";

describe("VaultTimeoutSettingsService", () => {
  let accountService: FakeAccountService;
  let pinService: MockProxy<PinServiceAbstraction>;
  let userDecryptionOptionsService: MockProxy<UserDecryptionOptionsServiceAbstraction>;
  let cryptoService: MockProxy<CryptoService>;
  let tokenService: MockProxy<TokenService>;
  let policyService: MockProxy<PolicyService>;
  let stateService: MockProxy<StateService>;
  const biometricStateService = mock<BiometricStateService>();
  let service: VaultTimeoutSettingsService;

  let userDecryptionOptionsSubject: BehaviorSubject<UserDecryptionOptions>;

  const mockUserId = Utils.newGuid() as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith(mockUserId);
    pinService = mock<PinServiceAbstraction>();
    userDecryptionOptionsService = mock<UserDecryptionOptionsServiceAbstraction>();
    cryptoService = mock<CryptoService>();
    tokenService = mock<TokenService>();
    policyService = mock<PolicyService>();
    stateService = mock<StateService>();

    userDecryptionOptionsSubject = new BehaviorSubject(null);
    userDecryptionOptionsService.userDecryptionOptions$ = userDecryptionOptionsSubject;
    userDecryptionOptionsService.hasMasterPassword$ = userDecryptionOptionsSubject.pipe(
      map((options) => options?.hasMasterPassword ?? false),
    );
    userDecryptionOptionsService.userDecryptionOptionsById$.mockReturnValue(
      userDecryptionOptionsSubject,
    );

    service = new VaultTimeoutSettingsService(
      accountService,
      pinService,
      userDecryptionOptionsService,
      cryptoService,
      tokenService,
      policyService,
      stateService,
      biometricStateService,
    );

    biometricStateService.biometricUnlockEnabled$ = of(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("availableVaultTimeoutActions$", () => {
    it("always returns LogOut", async () => {
      const result = await firstValueFrom(service.availableVaultTimeoutActions$());

      expect(result).toContain(VaultTimeoutAction.LogOut);
    });

    it("contains Lock when the user has a master password", async () => {
      userDecryptionOptionsSubject.next(new UserDecryptionOptions({ hasMasterPassword: true }));

      const result = await firstValueFrom(service.availableVaultTimeoutActions$());

      expect(result).toContain(VaultTimeoutAction.Lock);
    });

    it("contains Lock when the user has either a persistent or ephemeral PIN configured", async () => {
      pinService.isPinSet.mockResolvedValue(true);

      const result = await firstValueFrom(service.availableVaultTimeoutActions$());

      expect(result).toContain(VaultTimeoutAction.Lock);
    });

    it("contains Lock when the user has biometrics configured", async () => {
      biometricStateService.biometricUnlockEnabled$ = of(true);
      biometricStateService.getBiometricUnlockEnabled.mockResolvedValue(true);

      const result = await firstValueFrom(service.availableVaultTimeoutActions$());

      expect(result).toContain(VaultTimeoutAction.Lock);
    });

    it("not contains Lock when the user does not have a master password, PIN, or biometrics", async () => {
      userDecryptionOptionsSubject.next(new UserDecryptionOptions({ hasMasterPassword: false }));
      pinService.isPinSet.mockResolvedValue(false);
      biometricStateService.biometricUnlockEnabled$ = of(false);

      const result = await firstValueFrom(service.availableVaultTimeoutActions$());

      expect(result).not.toContain(VaultTimeoutAction.Lock);
    });
  });

  describe("vaultTimeoutAction$", () => {
    describe("given the user has a master password", () => {
      it.each`
        policy                       | userPreference               | expected
        ${null}                      | ${null}                      | ${VaultTimeoutAction.Lock}
        ${null}                      | ${VaultTimeoutAction.LogOut} | ${VaultTimeoutAction.LogOut}
        ${VaultTimeoutAction.LogOut} | ${null}                      | ${VaultTimeoutAction.LogOut}
        ${VaultTimeoutAction.LogOut} | ${VaultTimeoutAction.Lock}   | ${VaultTimeoutAction.LogOut}
      `(
        "returns $expected when policy is $policy, and user preference is $userPreference",
        async ({ policy, userPreference, expected }) => {
          userDecryptionOptionsSubject.next(new UserDecryptionOptions({ hasMasterPassword: true }));
          policyService.getAll$.mockReturnValue(
            of(policy === null ? [] : ([{ data: { action: policy } }] as unknown as Policy[])),
          );
          stateService.getVaultTimeoutAction.mockResolvedValue(userPreference);

          const result = await firstValueFrom(service.vaultTimeoutAction$());

          expect(result).toBe(expected);
        },
      );
    });

    describe("given the user does not have a master password", () => {
      it.each`
        unlockMethod | policy                     | userPreference               | expected
        ${false}     | ${null}                    | ${null}                      | ${VaultTimeoutAction.LogOut}
        ${false}     | ${null}                    | ${VaultTimeoutAction.Lock}   | ${VaultTimeoutAction.LogOut}
        ${false}     | ${VaultTimeoutAction.Lock} | ${null}                      | ${VaultTimeoutAction.LogOut}
        ${true}      | ${null}                    | ${null}                      | ${VaultTimeoutAction.LogOut}
        ${true}      | ${null}                    | ${VaultTimeoutAction.Lock}   | ${VaultTimeoutAction.Lock}
        ${true}      | ${VaultTimeoutAction.Lock} | ${null}                      | ${VaultTimeoutAction.Lock}
        ${true}      | ${VaultTimeoutAction.Lock} | ${VaultTimeoutAction.LogOut} | ${VaultTimeoutAction.Lock}
      `(
        "returns $expected when policy is $policy, has unlock method is $unlockMethod, and user preference is $userPreference",
        async ({ unlockMethod, policy, userPreference, expected }) => {
          biometricStateService.biometricUnlockEnabled$ = of(unlockMethod);
          biometricStateService.getBiometricUnlockEnabled.mockResolvedValue(unlockMethod);

          userDecryptionOptionsSubject.next(
            new UserDecryptionOptions({ hasMasterPassword: false }),
          );
          policyService.getAll$.mockReturnValue(
            of(policy === null ? [] : ([{ data: { action: policy } }] as unknown as Policy[])),
          );
          stateService.getVaultTimeoutAction.mockResolvedValue(userPreference);

          const result = await firstValueFrom(service.vaultTimeoutAction$());

          expect(result).toBe(expected);
        },
      );
    });
  });
});
