import { CachedServices } from "../background/service_factories/factory-options";

type Listener<T extends unknown[]> = (...args: [...T, CachedServices]) => void;

export const combine = <T extends unknown[]>(
  listeners: Listener<T>[],
  startingServices: CachedServices = {}
) => {
  return (...args: T) => {
    const cachedServices = { ...startingServices };
    for (const listener of listeners) {
      listener(...[...args, cachedServices]);
    }
  };
};
