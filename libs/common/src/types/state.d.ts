import { Opaque } from "type-fest";

type StorageKey = Opaque<string, "StorageKey">;

type DerivedStateDependencies = Record<string, unknown>;
