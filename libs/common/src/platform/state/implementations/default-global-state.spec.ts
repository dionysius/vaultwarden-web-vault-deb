/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */

import { Jsonify } from "type-fest";

import { trackEmissions } from "../../../../spec";
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

const testKeyDefinition = new KeyDefinition<TestState>(
  testStateDefinition,
  "fake",
  TestState.fromJSON
);
const globalKey = globalKeyBuilder(testKeyDefinition);

describe("DefaultGlobalState", () => {
  let diskStorageService: FakeStorageService;
  let globalState: DefaultGlobalState<TestState>;

  beforeEach(() => {
    diskStorageService = new FakeStorageService();
    globalState = new DefaultGlobalState(testKeyDefinition, diskStorageService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should emit when storage updates", async () => {
    const emissions = trackEmissions(globalState.state$);
    const newData = { date: new Date() };
    await diskStorageService.save(globalKey, newData);

    expect(emissions).toEqual([
      null, // Initial value
      newData,
      // JSON.parse(JSON.stringify(newData)), // This is due to the way `trackEmissions` clones
    ]);
  });

  it("should not emit when update key does not match", async () => {
    const emissions = trackEmissions(globalState.state$);
    const newData = { date: new Date() };
    await diskStorageService.save("wrong_key", newData);

    expect(emissions).toEqual(
      expect.arrayContaining([
        null, // Initial value
      ])
    );
  });

  it("should save on update", async () => {
    const newData = { date: new Date() };
    const result = await globalState.update((state) => {
      return newData;
    });

    expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(newData);
  });

  it("should emit once per update", async () => {
    const emissions = trackEmissions(globalState.state$);
    const newData = { date: new Date() };

    await globalState.update((state) => {
      return newData;
    });

    expect(emissions).toEqual([
      null, // Initial value
      newData,
    ]);
  });
});
