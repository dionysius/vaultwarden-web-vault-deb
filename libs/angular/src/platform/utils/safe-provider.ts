import { Provider } from "@angular/core";
import { Constructor, Opaque } from "type-fest";

import { SafeInjectionToken } from "../../services/injection-tokens";

/**
 * The return type of the {@link safeProvider} helper function.
 * Used to distinguish a type safe provider definition from a non-type safe provider definition.
 */
export type SafeProvider = Opaque<Provider>;

// TODO: type-fest also provides a type like this when we upgrade >= 3.7.0
type AbstractConstructor<T> = abstract new (...args: any) => T;

type MapParametersToDeps<T> = {
  [K in keyof T]: AbstractConstructor<T[K]> | SafeInjectionToken<T[K]>;
};

type SafeInjectionTokenType<T> = T extends SafeInjectionToken<infer J> ? J : never;

/**
 * Gets the instance type from a constructor, abstract constructor, or SafeInjectionToken
 */
type ProviderInstanceType<T> =
  T extends SafeInjectionToken<any>
    ? InstanceType<SafeInjectionTokenType<T>>
    : T extends Constructor<any> | AbstractConstructor<any>
      ? InstanceType<T>
      : never;

/**
 * Represents a dependency provided with the useClass option.
 */
type SafeClassProvider<
  A extends AbstractConstructor<any> | SafeInjectionToken<any>,
  I extends Constructor<ProviderInstanceType<A>>,
  D extends MapParametersToDeps<ConstructorParameters<I>>,
> = {
  provide: A;
  useClass: I;
  deps: D;
};

/**
 * Represents a dependency provided with the useValue option.
 */
type SafeValueProvider<A extends SafeInjectionToken<any>, V extends SafeInjectionTokenType<A>> = {
  provide: A;
  useValue: V;
};

/**
 * Represents a dependency provided with the useFactory option.
 */
type SafeFactoryProvider<
  A extends AbstractConstructor<any> | SafeInjectionToken<any>,
  I extends (...args: any) => ProviderInstanceType<A>,
  D extends MapParametersToDeps<Parameters<I>>,
> = {
  provide: A;
  useFactory: I;
  deps: D;
  multi?: boolean;
};

/**
 * Represents a dependency provided with the useExisting option.
 */
type SafeExistingProvider<
  A extends Constructor<any> | AbstractConstructor<any> | SafeInjectionToken<any>,
  I extends Constructor<ProviderInstanceType<A>> | AbstractConstructor<ProviderInstanceType<A>>,
> = {
  provide: A;
  useExisting: I;
};

/**
 * A factory function that creates a provider for the ngModule providers array.
 * This guarantees type safety for your provider definition. It does nothing at runtime.
 * @param provider Your provider object in the usual shape (e.g. using useClass, useValue, useFactory, etc.)
 * @returns The exact same object without modification (pass-through).
 */
export const safeProvider = <
  // types for useClass
  AClass extends AbstractConstructor<any> | SafeInjectionToken<any>,
  IClass extends Constructor<ProviderInstanceType<AClass>>,
  DClass extends MapParametersToDeps<ConstructorParameters<IClass>>,
  // types for useValue
  AValue extends SafeInjectionToken<any>,
  VValue extends SafeInjectionTokenType<AValue>,
  // types for useFactory
  AFactory extends AbstractConstructor<any> | SafeInjectionToken<any>,
  IFactory extends (...args: any) => ProviderInstanceType<AFactory>,
  DFactory extends MapParametersToDeps<Parameters<IFactory>>,
  // types for useExisting
  AExisting extends Constructor<any> | AbstractConstructor<any> | SafeInjectionToken<any>,
  IExisting extends
    | Constructor<ProviderInstanceType<AExisting>>
    | AbstractConstructor<ProviderInstanceType<AExisting>>,
>(
  provider:
    | SafeClassProvider<AClass, IClass, DClass>
    | SafeValueProvider<AValue, VValue>
    | SafeFactoryProvider<AFactory, IFactory, DFactory>
    | SafeExistingProvider<AExisting, IExisting>
    | Constructor<unknown>,
): SafeProvider => provider as SafeProvider;
