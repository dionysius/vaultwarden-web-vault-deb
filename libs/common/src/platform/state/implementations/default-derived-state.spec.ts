/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */
import { Subject, firstValueFrom } from "rxjs";

import { awaitAsync, trackEmissions } from "../../../../spec";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { DeriveDefinition } from "../derive-definition";
import { StateDefinition } from "../state-definition";

import { DefaultDerivedState } from "./default-derived-state";

let callCount = 0;
const cleanupDelayMs = 10;
const stateDefinition = new StateDefinition("test", "memory");
const deriveDefinition = new DeriveDefinition<string, Date, { date: Date }>(
  stateDefinition,
  "test",
  {
    derive: (dateString: string) => {
      callCount++;
      return new Date(dateString);
    },
    deserializer: (dateString: string) => new Date(dateString),
    cleanupDelayMs,
  },
);

describe("DefaultDerivedState", () => {
  let parentState$: Subject<string>;
  let memoryStorage: FakeStorageService;
  let sut: DefaultDerivedState<string, Date, { date: Date }>;
  const deps = {
    date: new Date(),
  };

  beforeEach(() => {
    callCount = 0;
    parentState$ = new Subject();
    memoryStorage = new FakeStorageService();
    sut = new DefaultDerivedState(parentState$, deriveDefinition, memoryStorage, deps);
  });

  afterEach(() => {
    parentState$.complete();
    jest.resetAllMocks();
  });

  it("should derive the state", async () => {
    const dateString = "2020-01-01";
    const emissions = trackEmissions(sut.state$);

    parentState$.next(dateString);
    await awaitAsync();

    expect(emissions).toEqual([new Date(dateString)]);
  });

  it("should derive the state once", async () => {
    const dateString = "2020-01-01";
    trackEmissions(sut.state$);

    parentState$.next(dateString);

    expect(callCount).toBe(1);
  });

  it("should store the derived state in memory", async () => {
    const dateString = "2020-01-01";
    trackEmissions(sut.state$);
    parentState$.next(dateString);
    await awaitAsync();

    expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(
      new Date(dateString),
    );
    const calls = memoryStorage.mock.save.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(deriveDefinition.buildCacheKey());
    expect(calls[0][1]).toEqual(new Date(dateString));
  });

  describe("forceValue", () => {
    const initialParentValue = "2020-01-01";
    const forced = new Date("2020-02-02");
    let emissions: Date[];

    describe("without observers", () => {
      beforeEach(async () => {
        parentState$.next(initialParentValue);
        await awaitAsync();
      });

      it("should store the forced value", async () => {
        await sut.forceValue(forced);
        expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(forced);
      });
    });

    describe("with observers", () => {
      beforeEach(async () => {
        emissions = trackEmissions(sut.state$);
        parentState$.next(initialParentValue);
        await awaitAsync();
      });

      it("should store the forced value", async () => {
        await sut.forceValue(forced);
        expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(forced);
      });

      it("should force the value", async () => {
        await sut.forceValue(forced);
        expect(emissions).toEqual([new Date(initialParentValue), forced]);
      });

      it("should only force the value once", async () => {
        await sut.forceValue(forced);

        parentState$.next(initialParentValue);
        await awaitAsync();

        expect(emissions).toEqual([
          new Date(initialParentValue),
          forced,
          new Date(initialParentValue),
        ]);
      });
    });
  });

  describe("cleanup", () => {
    const newDate = "2020-02-02";

    it("should cleanup after last subscriber", async () => {
      const subscription = sut.state$.subscribe();
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(parentState$.observed).toBe(false);
    });

    it("should clear state after cleanup", async () => {
      const subscription = sut.state$.subscribe();
      parentState$.next(newDate);
      await awaitAsync();

      expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(
        new Date(newDate),
      );

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toBeUndefined();
    });

    it("should not clear state after cleanup if clearOnCleanup is false", async () => {
      deriveDefinition.options.clearOnCleanup = false;

      const subscription = sut.state$.subscribe();
      parentState$.next(newDate);
      await awaitAsync();

      expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(
        new Date(newDate),
      );

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(memoryStorage.internalStore[deriveDefinition.buildCacheKey()]).toEqual(
        new Date(newDate),
      );
    });

    it("should not cleanup if there are still subscribers", async () => {
      const subscription1 = sut.state$.subscribe();
      const sub2Emissions: Date[] = [];
      const subscription2 = sut.state$.subscribe((v) => sub2Emissions.push(v));
      await awaitAsync();

      subscription1.unsubscribe();

      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      // Still be listening to parent updates
      parentState$.next(newDate);
      await awaitAsync();
      expect(sub2Emissions).toEqual([new Date(newDate)]);

      subscription2.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(parentState$.observed).toBe(false);
    });

    it("can re-initialize after cleanup", async () => {
      const subscription = sut.state$.subscribe();
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      const emissions = trackEmissions(sut.state$);
      await awaitAsync();

      parentState$.next(newDate);
      await awaitAsync();

      expect(emissions).toEqual([new Date(newDate)]);
    });

    it("should not cleanup if a subscriber joins during the cleanup delay", async () => {
      const subscription = sut.state$.subscribe();
      await awaitAsync();

      await parentState$.next(newDate);
      await awaitAsync();

      subscription.unsubscribe();
      // Do not wait long enough for cleanup
      await awaitAsync(cleanupDelayMs / 2);

      expect(parentState$.observed).toBe(true); // still listening to parent

      const emissions = trackEmissions(sut.state$);
      expect(emissions).toEqual([new Date(newDate)]); // we didn't lose our buffered value
    });

    it("state$ observables are durable to cleanup", async () => {
      const observable = sut.state$;
      let subscription = observable.subscribe();

      await parentState$.next(newDate);
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      subscription = observable.subscribe();
      await parentState$.next(newDate);
      await awaitAsync();

      expect(await firstValueFrom(observable)).toEqual(new Date(newDate));
    });
  });
});
