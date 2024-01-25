import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { KeyDefinition } from "@bitwarden/common/platform/state";
/* eslint-disable import/no-restricted-paths -- Needed to extend service & and in platform owned file */
import { DefaultSingleUserStateProvider } from "@bitwarden/common/platform/state/implementations/default-single-user-state.provider";
import { StateDefinition } from "@bitwarden/common/platform/state/state-definition";
/* eslint-enable import/no-restricted-paths */

export class WebSingleUserStateProvider extends DefaultSingleUserStateProvider {
  constructor(
    memoryStorageService: AbstractMemoryStorageService & ObservableStorageService,
    sessionStorageService: AbstractStorageService & ObservableStorageService,
    private readonly diskLocalStorageService: AbstractStorageService & ObservableStorageService,
  ) {
    super(memoryStorageService, sessionStorageService);
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
        return this.diskLocalStorageService;
    }
  }
}
