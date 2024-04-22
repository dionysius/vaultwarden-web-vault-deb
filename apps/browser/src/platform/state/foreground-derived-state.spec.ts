/**
 * need to update test environment so structuredClone works appropriately
 * @jest-environment ../../libs/shared/test.environment.ts
 */

import { NgZone } from "@angular/core";
import { awaitAsync, trackEmissions } from "@bitwarden/common/../spec";
import { FakeStorageService } from "@bitwarden/common/../spec/fake-storage.service";
import { mock } from "jest-mock-extended";

import { DeriveDefinition } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- needed to define a derive definition
import { StateDefinition } from "@bitwarden/common/platform/state/state-definition";

import { mockPorts } from "../../../spec/mock-port.spec-util";

import { ForegroundDerivedState } from "./foreground-derived-state";

const stateDefinition = new StateDefinition("test", "memory");
const deriveDefinition = new DeriveDefinition(stateDefinition, "test", {
  derive: (dateString: string) => (dateString == null ? null : new Date(dateString)),
  deserializer: (dateString: string) => (dateString == null ? null : new Date(dateString)),
  cleanupDelayMs: 1,
});

// Mock out the runInsideAngular operator so we don't have to deal with zone.js
jest.mock("../browser/run-inside-angular.operator", () => {
  return {
    runInsideAngular: (ngZone: any) => (source: any) => source,
  };
});

describe("ForegroundDerivedState", () => {
  let sut: ForegroundDerivedState<Date>;
  let memoryStorage: FakeStorageService;
  const portName = "testPort";
  const ngZone = mock<NgZone>();

  beforeEach(() => {
    memoryStorage = new FakeStorageService();
    memoryStorage.internalUpdateValuesRequireDeserialization(true);
    mockPorts();
    sut = new ForegroundDerivedState(deriveDefinition, memoryStorage, portName, ngZone);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should not connect a port until subscribed", async () => {
    expect(sut["port"]).toBeUndefined();
    const subscription = sut.state$.subscribe();

    expect(sut["port"]).toBeDefined();
    subscription.unsubscribe();
  });

  it("should disconnect its port when unsubscribed", async () => {
    const subscription = sut.state$.subscribe();

    expect(sut["port"]).toBeDefined();
    const disconnectSpy = jest.spyOn(sut["port"], "disconnect");
    subscription.unsubscribe();
    // wait for the cleanup delay
    await awaitAsync(deriveDefinition.cleanupDelayMs * 2);

    expect(disconnectSpy).toHaveBeenCalled();
    expect(sut["port"]).toBeNull();
  });

  it("should emit when the memory storage updates", async () => {
    const dateString = "2020-01-01";
    const emissions = trackEmissions(sut.state$);

    await memoryStorage.save(deriveDefinition.storageKey, {
      derived: true,
      value: new Date(dateString),
    });

    await awaitAsync();

    expect(emissions).toEqual([new Date(dateString)]);
  });
});
