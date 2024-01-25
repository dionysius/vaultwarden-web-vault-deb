import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { KeyDefinition } from "@bitwarden/common/platform/state";
/* eslint-disable import/no-restricted-paths -- Needed to extend class & in platform owned code */
import { DefaultActiveUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-active-user-state.provider";
import { StateDefinition } from "@bitwarden/common/platform/state/state-definition";
/* eslint-enable import/no-restricted-paths */

export class WebActiveUserStateProvider extends DefaultActiveUserStateProvider {
  constructor(
    accountService: AccountService,
    memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    sessionStorage: AbstractStorageService & ObservableStorageService,
    private readonly diskLocalStorage: AbstractStorageService & ObservableStorageService,
  ) {
    super(accountService, memoryStorage, sessionStorage);
  }

  protected override getLocationString(keyDefinition: KeyDefinition<unknown>): string {
    return (
      keyDefinition.stateDefinition.storageLocationOverrides["web"] ??
      keyDefinition.stateDefinition.defaultStorageLocation
    );
  }

  protected override getLocation(
    stateDefinition: StateDefinition,
  ): AbstractStorageService & ObservableStorageService {
    const location =
      stateDefinition.storageLocationOverrides["web"] ?? stateDefinition.defaultStorageLocation;
    switch (location) {
      case "disk":
        return this.diskStorage;
      case "memory":
        return this.memoryStorage;
      case "disk-local":
        return this.diskLocalStorage;
    }
  }
}
