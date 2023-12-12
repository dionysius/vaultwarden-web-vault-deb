/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */

import { firstValueFrom, of } from "rxjs";
import { Jsonify } from "type-fest";

import { trackEmissions, awaitAsync } from "../../../../spec";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { KeyDefinition, globalKeyBuilder } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultGlobalState } from "./default-global-state";

class TestState {
  date: Date;

  static fromJSON(jsonState: Jsonify<TestState>) {
    if (jsonState == null) {
      return null;
    }

    return Object.assign(new TestState(), jsonState, {
      date: new Date(jsonState.date),
    });
  }
}

const testStateDefinition = new StateDefinition("fake", "disk");

const testKeyDefinition = new KeyDefinition<TestState>(testStateDefinition, "fake", {
  deserializer: TestState.fromJSON,
});
const globalKey = globalKeyBuilder(testKeyDefinition);

describe("DefaultGlobalState", () => {
  let diskStorageService: FakeStorageService;
  let globalState: DefaultGlobalState<TestState>;
  const newData = { date: new Date() };

  beforeEach(() => {
    diskStorageService = new FakeStorageService();
    globalState = new DefaultGlobalState(testKeyDefinition, diskStorageService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("state$", () => {
    it("should emit when storage updates", async () => {
      const emissions = trackEmissions(globalState.state$);
      await diskStorageService.save(globalKey, newData);
      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should not emit when update key does not match", async () => {
      const emissions = trackEmissions(globalState.state$);
      await diskStorageService.save("wrong_key", newData);

      expect(emissions).toHaveLength(0);
    });

    it("should emit initial storage value on first subscribe", async () => {
      const initialStorage: Record<string, TestState> = {};
      initialStorage[globalKey] = TestState.fromJSON({
        date: "2022-09-21T13:14:17.648Z",
      });
      diskStorageService.internalUpdateStore(initialStorage);

      const state = await firstValueFrom(globalState.state$);
      expect(diskStorageService.mock.get).toHaveBeenCalledTimes(1);
      expect(diskStorageService.mock.get).toHaveBeenCalledWith("global_fake_fake", undefined);
      expect(state).toBeTruthy();
    });
  });

  describe("update", () => {
    it("should save on update", async () => {
      const result = await globalState.update((state) => {
        return newData;
      });

      expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newData);
    });

    it("should emit once per update", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      await globalState.update((state) => {
        return newData;
      });

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should provided combined dependencies", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const combinedDependencies = { date: new Date() };

      await globalState.update(
        (state, dependencies) => {
          expect(dependencies).toEqual(combinedDependencies);
          return newData;
        },
        {
          combineLatestWith: of(combinedDependencies),
        },
      );

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should not update if shouldUpdate returns false", async () => {
      const emissions = trackEmissions(globalState.state$);

      const result = await globalState.update(
        (state) => {
          return newData;
        },
        {
          shouldUpdate: () => false,
        },
      );

      expect(diskStorageService.mock.save).not.toHaveBeenCalled();
      expect(emissions).toEqual([null]); // Initial value
      expect(result).toBeNull();
    });

    it("should provide the update callback with the current State", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      // Seed with interesting data
      const initialData = { date: new Date(2020, 1, 1) };
      await globalState.update((state, dependencies) => {
        return initialData;
      });

      await awaitAsync();

      await globalState.update((state) => {
        expect(state).toEqual(initialData);
        return newData;
      });

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        initialData,
        newData,
      ]);
    });

    it("should give initial state for update call", async () => {
      const initialStorage: Record<string, TestState> = {};
      const initialState = TestState.fromJSON({
        date: "2022-09-21T13:14:17.648Z",
      });
      initialStorage[globalKey] = initialState;
      diskStorageService.internalUpdateStore(initialStorage);

      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const newState = {
        ...initialState,
        date: new Date(initialState.date.getFullYear(), initialState.date.getMonth() + 1),
      };
      const actual = await globalState.update((existingState) => newState);

      await awaitAsync();

      expect(actual).toEqual(newState);
      expect(emissions).toHaveLength(2);
      expect(emissions).toEqual(expect.arrayContaining([initialState, newState]));
    });
  });
});
