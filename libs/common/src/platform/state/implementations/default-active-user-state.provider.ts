import { Observable, map } from "rxjs";

import { AccountService } from "../../../auth/abstractions/account.service";
import { UserId } from "../../../types/guid";
import { StorageServiceProvider } from "../../services/storage-service.provider";
import { KeyDefinition } from "../key-definition";
import { StateEventRegistrarService } from "../state-event-registrar.service";
import { UserKeyDefinition, isUserKeyDefinition } from "../user-key-definition";
import { ActiveUserState } from "../user-state";
import { ActiveUserStateProvider } from "../user-state.provider";

import { DefaultActiveUserState } from "./default-active-user-state";

export class DefaultActiveUserStateProvider implements ActiveUserStateProvider {
  private cache: Record<string, ActiveUserState<unknown>> = {};

  activeUserId$: Observable<UserId | undefined>;

  constructor(
    private readonly accountService: AccountService,
    private readonly storageServiceProvider: StorageServiceProvider,
    private readonly stateEventRegistrarService: StateEventRegistrarService,
  ) {
    this.activeUserId$ = this.accountService.activeAccount$.pipe(map((account) => account?.id));
  }

  get<T>(keyDefinition: KeyDefinition<T> | UserKeyDefinition<T>): ActiveUserState<T> {
    if (!isUserKeyDefinition(keyDefinition)) {
      keyDefinition = UserKeyDefinition.fromBaseKeyDefinition(keyDefinition);
    }
    const [location, storageService] = this.storageServiceProvider.get(
      keyDefinition.stateDefinition.defaultStorageLocation,
      keyDefinition.stateDefinition.storageLocationOverrides,
    );
    const cacheKey = this.buildCacheKey(location, keyDefinition);
    const existingUserState = this.cache[cacheKey];
    if (existingUserState != null) {
      // I have to cast out of the unknown generic but this should be safe if rules
      // around domain token are made
      return existingUserState as ActiveUserState<T>;
    }

    const newUserState = new DefaultActiveUserState<T>(
      keyDefinition,
      this.accountService,
      storageService,
      this.stateEventRegistrarService,
    );
    this.cache[cacheKey] = newUserState;
    return newUserState;
  }

  private buildCacheKey(location: string, keyDefinition: UserKeyDefinition<unknown>) {
    return `${location}_${keyDefinition.fullName}`;
  }
}
