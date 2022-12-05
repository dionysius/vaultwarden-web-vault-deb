import { Jsonify } from "type-fest";

import { SessionStorable } from "./session-storable";
import { InitializeOptions } from "./sync-item-metadata";

class BuildOptions<T, TJson = Jsonify<T>> {
  ctor?: new () => T;
  initializer?: (keyValuePair: TJson) => T;
  initializeAs?: InitializeOptions;
}

// Used to ensure uniqueness for each synced observable
let index = 0;

/**
 * A decorator used to indicate the BehaviorSubject should be synced for this browser session across all contexts.
 *
 * >**Note** This decorator does nothing if the enclosing class is not decorated with @browserSession.
 *
 * >**Note** The Behavior subject must be initialized with a default or in the constructor of the class. If it is not, an error will be thrown.
 *
 * >**!!Warning!!** If the property is overwritten at any time, the new value will not be synced across the browser session.
 *
 * @param buildOptions
 * Builders for the value, requires either a constructor (ctor) for your BehaviorSubject type or an
 * initializer function that takes a key value pair representation of the BehaviorSubject data
 * and returns your instantiated BehaviorSubject value. `initializeAs can optionally be used to indicate
 * the provided initializer function should be used to build an array of values. For example,
 * ```ts
 * \@sessionSync({ initializer: Foo.fromJSON, initializeAs: 'array' })
 * ```
 * is equivalent to
 * ```
 * \@sessionSync({ initializer: (obj: any[]) => obj.map((f) => Foo.fromJSON })
 * ```
 *
 * @returns decorator function
 */
export function sessionSync<T>(buildOptions: BuildOptions<T>) {
  return (prototype: unknown, propertyKey: string) => {
    // Force prototype into SessionStorable and implement it.
    const p = prototype as SessionStorable;

    if (p.__syncedItemMetadata == null) {
      p.__syncedItemMetadata = [];
    }

    p.__syncedItemMetadata.push({
      propertyKey,
      sessionKey: `${propertyKey}_${index++}`,
      ctor: buildOptions.ctor,
      initializer: buildOptions.initializer,
      initializeAs: buildOptions.initializeAs ?? "object",
    });
  };
}
