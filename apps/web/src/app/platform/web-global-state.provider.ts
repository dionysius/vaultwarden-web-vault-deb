import {
  AbstractMemoryStorageService,
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { KeyDefinition } from "@bitwarden/common/platform/state";
/* eslint-disable import/no-restricted-paths -- Needed to extend class & in platform owned code*/
import { DefaultGlobalStateProvider } from "@bitwarden/common/platform/state/implementations/default-global-state.provider";
import { StateDefinition } from "@bitwarden/common/platform/state/state-definition";
/* eslint-enable import/no-restricted-paths */

export class WebGlobalStateProvider extends DefaultGlobalStateProvider {
  constructor(
    memoryStorage: AbstractMemoryStorageService & ObservableStorageService,
    sessionStorage: AbstractStorageService & ObservableStorageService,
    private readonly diskLocalStorage: AbstractStorageService & ObservableStorageService,
  ) {
    super(memoryStorage, sessionStorage);
  }

  protected getLocationString(keyDefinition: KeyDefinition<unknown>): string {
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
