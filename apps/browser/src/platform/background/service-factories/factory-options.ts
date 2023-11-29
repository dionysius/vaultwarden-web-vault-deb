export type CachedServices = Record<string, unknown>;

export type FactoryOptions = {
  alwaysInitializeNewService?: boolean;
  doNotStoreInitializedService?: boolean;
  [optionsKey: string]: unknown;
};

export async function factory<
  TCache extends CachedServices,
  TName extends keyof TCache,
  TOpts extends FactoryOptions,
>(
  cachedServices: TCache,
  name: TName,
  opts: TOpts,
  factory: () => TCache[TName] | Promise<TCache[TName]>,
): Promise<TCache[TName]> {
  let instance = cachedServices[name];
  if (opts.alwaysInitializeNewService || !instance) {
    const instanceOrPromise = factory();
    instance = instanceOrPromise instanceof Promise ? await instanceOrPromise : instanceOrPromise;
  }

  if (!opts.doNotStoreInitializedService) {
    cachedServices[name] = instance;
  }

  return instance as TCache[TName];
}
