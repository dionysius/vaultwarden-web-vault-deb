import { GroupPolicyEnvironment } from "./types/group-policy-environment";

function getFlags<T>(envFlags: string | T): T {
  if (typeof envFlags === "string") {
    return JSON.parse(envFlags) as T;
  } else {
    return envFlags as T;
  }
}

/* Placeholder for when we have a relevant feature flag
export type Flags = { test?: boolean };
export type FlagName = keyof Flags;
export function flagEnabled(flag: FlagName): boolean {
  const flags = getFlags<Flags>(process.env.FLAGS);
  return flags[flag] == null || flags[flag];
}
*/

/**
 * These flags are useful for development and testing.
 * Dev Flags are always OFF in production.
 */
export type DevFlags = {
  storeSessionDecrypted?: boolean;
  managedEnvironment?: GroupPolicyEnvironment;
};

export type DevFlagName = keyof DevFlags;

/**
 * Gets whether the given dev flag is truthy.
 * Gets the value of a dev flag from environment.
 * Will always return false unless in development.
 * @param flag The name of the dev flag to check
 * @returns The value of the flag
 */
export function devFlagEnabled(flag: DevFlagName): boolean {
  if (process.env.ENV !== "development") {
    return false;
  }

  const devFlags = getFlags<DevFlags>(process.env.DEV_FLAGS);
  return devFlags[flag] == null || !!devFlags[flag];
}

/**
 * Gets the value of a dev flag from environment.
 * Will always return false unless in development.
 * @param flag The name of the dev flag to check
 * @returns The value of the flag
 * @throws Error if the flag is not enabled
 */
export function devFlagValue<K extends DevFlagName>(flag: K): DevFlags[K] {
  if (!devFlagEnabled(flag)) {
    throw new Error(`This method should not be called, it is protected by a disabled dev flag.`);
  }

  const devFlags = getFlags<DevFlags>(process.env.DEV_FLAGS);
  return devFlags[flag];
}
