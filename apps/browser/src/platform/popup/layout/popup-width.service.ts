import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

import {
  GlobalStateProvider,
  KeyDefinition,
  POPUP_STYLE_DISK,
} from "@bitwarden/common/platform/state";

/**
 *
 * Value represents width in pixels
 */
export const PopupWidthOptions = Object.freeze({
  default: 380,
  wide: 480,
  "extra-wide": 600,
});

type PopupWidthOptions = typeof PopupWidthOptions;
export type PopupWidthOption = keyof PopupWidthOptions;

const POPUP_WIDTH_KEY_DEF = new KeyDefinition<PopupWidthOption>(POPUP_STYLE_DISK, "popup-width", {
  deserializer: (s) => s,
});

/**
 * Updates the extension popup width based on a user setting
 **/
@Injectable({ providedIn: "root" })
export class PopupWidthService {
  private static readonly LocalStorageKey = "bw-popup-width";
  private readonly state = inject(GlobalStateProvider).get(POPUP_WIDTH_KEY_DEF);

  readonly width$: Observable<PopupWidthOption> = this.state.state$.pipe(
    map((state) => state ?? "default"),
  );

  async setWidth(width: PopupWidthOption) {
    await this.state.update(() => width);
  }

  /** Begin listening for state changes */
  init() {
    this.width$.subscribe((width: PopupWidthOption) => {
      PopupWidthService.setStyle(width);
      localStorage.setItem(PopupWidthService.LocalStorageKey, width);
    });
  }

  private static setStyle(width: PopupWidthOption) {
    const pxWidth = PopupWidthOptions[width] ?? PopupWidthOptions.default;
    document.body.style.minWidth = `${pxWidth}px`;
  }

  /**
   * To keep the popup size from flickering on bootstrap, we store the width in `localStorage` so we can quickly & synchronously reference it.
   **/
  static initBodyWidthFromLocalStorage() {
    const storedValue = localStorage.getItem(PopupWidthService.LocalStorageKey);
    this.setStyle(storedValue as any);
  }
}
