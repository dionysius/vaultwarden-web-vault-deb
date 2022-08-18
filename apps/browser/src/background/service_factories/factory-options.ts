export type CachedServices = Record<string, any>;

export type FactoryOptions = {
  alwaysInitializeNewService?: boolean;
  doNotStoreInitializedService?: boolean;
  [optionsKey: string]: unknown;
};

export function factory<
  TCache extends CachedServices,
  TName extends keyof TCache,
  TOpts extends FactoryOptions
>(cachedServices: TCache, name: TName, opts: TOpts, factory: () => TCache[TName]): TCache[TName] {
  let instance = cachedServices[name];
  if (opts.alwaysInitializeNewService || !instance) {
    instance = factory();
  }

  if (!opts.doNotStoreInitializedService) {
    cachedServices[name] = instance;
  }

  return instance as TCache[TName];
}
