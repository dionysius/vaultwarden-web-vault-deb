import { Observable, firstValueFrom, map } from "rxjs";

import { UserId } from "../../types/guid";
import { EncryptedString, EncString } from "../models/domain/enc-string";
import { ActiveUserState, StateProvider } from "../state";

import { ENCRYPTED_CLIENT_KEY_HALF, REQUIRE_PASSWORD_ON_START } from "./biometric.state";

export abstract class BiometricStateService {
  /**
   * If the user has elected to require a password on first unlock of an application instance, this key will store the
   * encrypted client key half used to unlock the vault.
   *
   * Tracks the currently active user
   */
  encryptedClientKeyHalf$: Observable<EncString | undefined>;
  /**
   * whether or not a password is required on first unlock after opening the application
   *
   * tracks the currently active user
   */
  requirePasswordOnStart$: Observable<boolean>;

  /**
   * Updates the require password on start state for the currently active user.
   *
   * If false, the encrypted client key half will be removed.
   * @param value whether or not a password is required on first unlock after opening the application
   */
  abstract setRequirePasswordOnStart(value: boolean): Promise<void>;
  abstract setEncryptedClientKeyHalf(encryptedKeyHalf: EncString, userId?: UserId): Promise<void>;
  abstract getEncryptedClientKeyHalf(userId: UserId): Promise<EncString>;
  abstract getRequirePasswordOnStart(userId: UserId): Promise<boolean>;
  abstract removeEncryptedClientKeyHalf(userId: UserId): Promise<void>;
}

export class DefaultBiometricStateService implements BiometricStateService {
  private requirePasswordOnStartState: ActiveUserState<boolean>;
  private encryptedClientKeyHalfState: ActiveUserState<EncryptedString | undefined>;
  encryptedClientKeyHalf$: Observable<EncString | undefined>;
  requirePasswordOnStart$: Observable<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.requirePasswordOnStartState = this.stateProvider.getActive(REQUIRE_PASSWORD_ON_START);
    this.requirePasswordOnStart$ = this.requirePasswordOnStartState.state$.pipe(
      map((value) => !!value),
    );

    this.encryptedClientKeyHalfState = this.stateProvider.getActive(ENCRYPTED_CLIENT_KEY_HALF);
    this.encryptedClientKeyHalf$ = this.encryptedClientKeyHalfState.state$.pipe(
      map(encryptedClientKeyHalfToEncString),
    );
  }

  async setRequirePasswordOnStart(value: boolean): Promise<void> {
    let currentActiveId: UserId;
    await this.requirePasswordOnStartState.update(
      (_, [userId]) => {
        currentActiveId = userId;
        return value;
      },
      {
        combineLatestWith: this.requirePasswordOnStartState.combinedState$,
      },
    );
    if (!value) {
      await this.removeEncryptedClientKeyHalf(currentActiveId);
    }
  }

  async setEncryptedClientKeyHalf(encryptedKeyHalf: EncString, userId?: UserId): Promise<void> {
    const value = encryptedKeyHalf?.encryptedString ?? null;
    if (userId) {
      await this.stateProvider.getUser(userId, ENCRYPTED_CLIENT_KEY_HALF).update(() => value);
    } else {
      await this.encryptedClientKeyHalfState.update(() => value);
    }
  }

  async removeEncryptedClientKeyHalf(userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, ENCRYPTED_CLIENT_KEY_HALF).update(() => null);
  }

  async getRequirePasswordOnStart(userId: UserId): Promise<boolean> {
    return !!(await firstValueFrom(
      this.stateProvider.getUser(userId, REQUIRE_PASSWORD_ON_START).state$,
    ));
  }

  async getEncryptedClientKeyHalf(userId: UserId): Promise<EncString> {
    return await firstValueFrom(
      this.stateProvider
        .getUser(userId, ENCRYPTED_CLIENT_KEY_HALF)
        .state$.pipe(map(encryptedClientKeyHalfToEncString)),
    );
  }

  async logout(userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, ENCRYPTED_CLIENT_KEY_HALF).update(() => null);
  }
}

function encryptedClientKeyHalfToEncString(
  encryptedKeyHalf: EncryptedString | undefined,
): EncString {
  return encryptedKeyHalf == null ? null : new EncString(encryptedKeyHalf);
}
