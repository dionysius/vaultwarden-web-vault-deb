import { SdkClientFactory } from "@bitwarden/common/platform/abstractions/sdk/sdk-client-factory";
import type { BitwardenClient } from "@bitwarden/sdk-internal";

import { BrowserApi } from "../../browser/browser-api";

// https://stackoverflow.com/a/47880734
const supported = (() => {
  try {
    if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
      );
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
})();

// Manifest v3 does not support dynamic imports in the service worker.
if (BrowserApi.isManifestVersion(3)) {
  if (supported) {
    // eslint-disable-next-line no-console
    console.debug("WebAssembly is supported in this environment");
    import("./wasm");
  } else {
    // eslint-disable-next-line no-console
    console.debug("WebAssembly is not supported in this environment");
    import("./fallback");
  }
}

// Manifest v2 expects dynamic imports to prevent timing issues.
async function load() {
  if (BrowserApi.isManifestVersion(3)) {
    return;
  }

  if (supported) {
    // eslint-disable-next-line no-console
    console.debug("WebAssembly is supported in this environment");
    await import("./wasm");
  } else {
    // eslint-disable-next-line no-console
    console.debug("WebAssembly is not supported in this environment");
    await import("./fallback");
  }
}

/**
 * SDK client factory with a js fallback for when WASM is not supported.
 *
 * Works both in popup and service worker.
 */
export class BrowserSdkClientFactory implements SdkClientFactory {
  async createSdkClient(
    ...args: ConstructorParameters<typeof BitwardenClient>
  ): Promise<BitwardenClient> {
    await load();

    return Promise.resolve((globalThis as any).init_sdk(...args));
  }
}
