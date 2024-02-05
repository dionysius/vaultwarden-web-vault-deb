import { Observable, firstValueFrom, map } from "rxjs";

import { UserId } from "../../types/guid";
import { EncryptedString, EncString } from "../models/domain/enc-string";
import { ActiveUserState, StateProvider } from "../state";

import { ENCRYPTED_CLIENT_KEY_HALF } from "./biometric.state";

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

  abstract setEncryptedClientKeyHalf(encryptedKeyHalf: EncString): Promise<void>;
  abstract getEncryptedClientKeyHalf(userId: UserId): Promise<EncString>;
  abstract getRequirePasswordOnStart(userId: UserId): Promise<boolean>;
  abstract removeEncryptedClientKeyHalf(userId: UserId): Promise<void>;
}

export class DefaultBiometricStateService implements BiometricStateService {
  private encryptedClientKeyHalfState: ActiveUserState<EncryptedString | undefined>;
  encryptedClientKeyHalf$: Observable<EncString | undefined>;
  requirePasswordOnStart$: Observable<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.encryptedClientKeyHalfState = this.stateProvider.getActive(ENCRYPTED_CLIENT_KEY_HALF);
    this.encryptedClientKeyHalf$ = this.encryptedClientKeyHalfState.state$.pipe(
      map(encryptedClientKeyHalfToEncString),
    );
    this.requirePasswordOnStart$ = this.encryptedClientKeyHalf$.pipe(map((keyHalf) => !!keyHalf));
  }

  async setEncryptedClientKeyHalf(encryptedKeyHalf: EncString): Promise<void> {
    await this.encryptedClientKeyHalfState.update(() => encryptedKeyHalf?.encryptedString ?? null);
  }

  async removeEncryptedClientKeyHalf(userId: UserId): Promise<void> {
    await this.stateProvider.getUser(userId, ENCRYPTED_CLIENT_KEY_HALF).update(() => null);
  }

  async getRequirePasswordOnStart(userId: UserId): Promise<boolean> {
    if (userId == null) {
      return false;
    }
    return !!(await this.getEncryptedClientKeyHalf(userId));
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
