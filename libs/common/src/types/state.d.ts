import { Opaque } from "type-fest";

type StorageKey = Opaque<string, "StorageKey">;

/**
 * A helper type defining Constructor types for javascript and `typeof T` types for Typescript
 */
type Type<T> = abstract new (...args: unknown[]) => T;

type DerivedStateDependencies = Record<string, Type<unknown>>;

/**
 * Converts an object of types to an object of instances
 */
type ShapeToInstances<T> = {
  [P in keyof T]: T[P] extends Type<infer R> ? R : never;
};
