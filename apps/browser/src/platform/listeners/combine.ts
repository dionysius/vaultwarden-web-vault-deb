import { CachedServices } from "../background/service-factories/factory-options";

type Listener<T extends unknown[]> = (...args: [...T, CachedServices]) => Promise<void>;

export const combine = <T extends unknown[]>(
  listeners: Listener<T>[],
  startingServices: CachedServices = {},
) => {
  return async (...args: T) => {
    const cachedServices = { ...startingServices };
    for (const listener of listeners) {
      await listener(...[...args, cachedServices]);
    }
  };
};
