import { map } from "rxjs";

import {
  DESKTOP_SETTINGS_DISK,
  KeyDefinition,
  StateProvider,
} from "@bitwarden/common/platform/state";

export const HARDWARE_ACCELERATION = new KeyDefinition<boolean>(
  DESKTOP_SETTINGS_DISK,
  "hardwareAcceleration",
  {
    deserializer: (v: boolean) => v,
  },
);

export class DesktopSettingsService {
  private hwState = this.stateProvider.getGlobal(HARDWARE_ACCELERATION);
  hardwareAcceleration$ = this.hwState.state$.pipe(map((v) => v ?? true));

  constructor(private stateProvider: StateProvider) {}

  async setHardwareAcceleration(enabled: boolean) {
    await this.hwState.update(() => enabled);
  }
}
