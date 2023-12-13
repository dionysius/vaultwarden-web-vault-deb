/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */
import { any, anySymbol, mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, of, timeout } from "rxjs";
import { Jsonify } from "type-fest";

import { awaitAsync, trackEmissions } from "../../../../spec";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { AccountInfo, AccountService } from "../../../auth/abstractions/account.service";
import { AuthenticationStatus } from "../../../auth/enums/authentication-status";
import { UserId } from "../../../types/guid";
import { KeyDefinition, userKeyBuilder } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultActiveUserState } from "./default-active-user-state";

class TestState {
  date: Date;
  array: string[];

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
const cleanupDelayMs = 10;
const testKeyDefinition = new KeyDefinition<TestState>(testStateDefinition, "fake", {
  deserializer: TestState.fromJSON,
  cleanupDelayMs,
});

describe("DefaultActiveUserState", () => {
  const accountService = mock<AccountService>();
  let diskStorageService: FakeStorageService;
  let activeAccountSubject: BehaviorSubject<{ id: UserId } & AccountInfo>;
  let userState: DefaultActiveUserState<TestState>;

  beforeEach(() => {
    activeAccountSubject = new BehaviorSubject<{ id: UserId } & AccountInfo>(undefined);
    accountService.activeAccount$ = activeAccountSubject;

    diskStorageService = new FakeStorageService();
    userState = new DefaultActiveUserState(
      testKeyDefinition,
      accountService,
      null, // Not testing anything with encrypt service
      diskStorageService,
    );
  });

  const makeUserId = (id: string) => {
    return id != null ? (`00000000-0000-1000-a000-00000000000${id}` as UserId) : undefined;
  };

  const changeActiveUser = async (id: string) => {
    const userId = makeUserId(id);
    activeAccountSubject.next({
      id: userId,
      email: `test${id}@example.com`,
      name: `Test User ${id}`,
      status: AuthenticationStatus.Unlocked,
    });
    await awaitAsync();
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("emits updates for each user switch and update", async () => {
    const user1 = "user_00000000-0000-1000-a000-000000000001_fake_fake";
    const user2 = "user_00000000-0000-1000-a000-000000000002_fake_fake";
    const state1 = {
      date: new Date(2021, 0),
      array: ["value1"],
    };
    const state2 = {
      date: new Date(2022, 0),
      array: ["value2"],
    };
    const initialState: Record<string, TestState> = {};
    initialState[user1] = state1;
    initialState[user2] = state2;
    diskStorageService.internalUpdateStore(initialState);

    const emissions = trackEmissions(userState.state$);

    // User signs in
    await changeActiveUser("1");
    await awaitAsync();

    // Service does an update
    const updatedState = {
      date: new Date(2023, 0),
      array: ["value3"],
    };
    await userState.update(() => updatedState);
    await awaitAsync();

    // Emulate an account switch
    await changeActiveUser("2");

    expect(emissions).toEqual([state1, updatedState, state2]);

    // Should be called three time to get state, once for each user and once for the update
    expect(diskStorageService.mock.get).toHaveBeenCalledTimes(3);
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      1,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      any(), // options
    );
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      2,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      any(), // options
    );
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      3,
      "user_00000000-0000-1000-a000-000000000002_fake_fake",
      any(), // options
    );

    // Should only have saved data for the first user
    expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
    expect(diskStorageService.mock.save).toHaveBeenNthCalledWith(
      1,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      updatedState,
      any(), // options
    );
  });

  it("will not emit any value if there isn't an active user", async () => {
    let resolvedValue: TestState | undefined = undefined;
    let rejectedError: Error | undefined = undefined;

    const promise = firstValueFrom(userState.state$.pipe(timeout(20)))
      .then((value) => {
        resolvedValue = value;
      })
      .catch((err) => {
        rejectedError = err;
      });
    await promise;

    expect(diskStorageService.mock.get).not.toHaveBeenCalled();

    expect(resolvedValue).toBe(undefined);
    expect(rejectedError).toBeTruthy();
    expect(rejectedError.message).toBe("Timeout has occurred");
  });

  it("will emit value for a new active user after subscription started", async () => {
    let resolvedValue: TestState | undefined = undefined;
    let rejectedError: Error | undefined = undefined;

    diskStorageService.internalUpdateStore({
      "user_00000000-0000-1000-a000-000000000001_fake_fake": {
        date: new Date(2020, 0),
        array: ["testValue"],
      } as TestState,
    });

    const promise = firstValueFrom(userState.state$.pipe(timeout(20)))
      .then((value) => {
        resolvedValue = value;
      })
      .catch((err) => {
        rejectedError = err;
      });
    await changeActiveUser("1");
    await promise;

    expect(diskStorageService.mock.get).toHaveBeenCalledTimes(1);

    expect(resolvedValue).toBeTruthy();
    expect(resolvedValue.array).toHaveLength(1);
    expect(resolvedValue.date.getUTCFullYear()).toBe(2020);
    expect(rejectedError).toBeFalsy();
  });

  it("should not emit a previous users value if that user is no longer active", async () => {
    const user1Data: Jsonify<TestState> = {
      date: "2020-09-21T13:14:17.648Z",
      array: ["value"],
    };
    const user2Data: Jsonify<TestState> = {
      date: "2020-09-21T13:14:17.648Z",
      array: [],
    };
    diskStorageService.internalUpdateStore({
      "user_00000000-0000-1000-a000-000000000001_fake_fake": user1Data,
      "user_00000000-0000-1000-a000-000000000002_fake_fake": user2Data,
    });

    // This starts one subscription on the observable for tracking emissions throughout
    // the whole test.
    const emissions = trackEmissions(userState.state$);

    // Change to a user with data
    await changeActiveUser("1");

    // This should always return a value right await
    const value = await firstValueFrom(userState.state$);
    expect(value).toEqual(user1Data);

    // Make it such that there is no active user
    await changeActiveUser(undefined);

    let resolvedValue: TestState | undefined = undefined;
    let rejectedError: Error | undefined = undefined;

    // Even if the observable has previously emitted a value it shouldn't have
    // a value for the user subscribing to it because there isn't an active user
    // to get data for.
    await firstValueFrom(userState.state$.pipe(timeout(20)))
      .then((value) => {
        resolvedValue = value;
      })
      .catch((err) => {
        rejectedError = err;
      });

    expect(resolvedValue).toBeUndefined();
    expect(rejectedError).not.toBeUndefined();
    expect(rejectedError.message).toBe("Timeout has occurred");

    // We need to figure out if something should be emitted
    // when there becomes no active user, if we don't want that to emit
    // this value is correct.
    expect(emissions).toEqual([user1Data]);
  });

  it("should not emit twice if there are two listeners", async () => {
    await changeActiveUser("1");
    const emissions = trackEmissions(userState.state$);
    const emissions2 = trackEmissions(userState.state$);
    await awaitAsync();

    expect(emissions).toEqual([
      null, // Initial value
    ]);
    expect(emissions2).toEqual([
      null, // Initial value
    ]);
  });

  describe("update", () => {
    const newData = { date: new Date(), array: ["test"] };
    beforeEach(async () => {
      await changeActiveUser("1");
    });

    it("should save on update", async () => {
      const result = await userState.update((state, dependencies) => {
        return newData;
      });

      expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newData);
    });

    it("should emit once per update", async () => {
      const emissions = trackEmissions(userState.state$);
      await awaitAsync(); // Need to await for the initial value to be emitted

      await userState.update((state, dependencies) => {
        return newData;
      });
      await awaitAsync();

      expect(emissions).toEqual([
        null, // initial value
        newData,
      ]);
    });

    it("should provide combined dependencies", async () => {
      const emissions = trackEmissions(userState.state$);
      await awaitAsync(); // Need to await for the initial value to be emitted

      const combinedDependencies = { date: new Date() };

      await userState.update(
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
        null, // initial value
        newData,
      ]);
    });

    it("should not update if shouldUpdate returns false", async () => {
      const emissions = trackEmissions(userState.state$);
      await awaitAsync(); // Need to await for the initial value to be emitted

      const result = await userState.update(
        (state, dependencies) => {
          return newData;
        },
        {
          shouldUpdate: () => false,
        },
      );

      await awaitAsync();

      expect(diskStorageService.mock.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(emissions).toEqual([null]);
    });

    it("should provide the current state to the update callback", async () => {
      const emissions = trackEmissions(userState.state$);
      await awaitAsync(); // Need to await for the initial value to be emitted

      // Seed with interesting data
      const initialData = { date: new Date(2020, 0), array: ["value1", "value2"] };
      await userState.update((state, dependencies) => {
        return initialData;
      });

      await awaitAsync();

      await userState.update((state, dependencies) => {
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
  });

  describe("update races", () => {
    const newData = { date: new Date(), array: ["test"] };
    const userId = makeUserId("1");

    beforeEach(async () => {
      await changeActiveUser("1");
      await awaitAsync();
    });

    test("subscriptions during an update should receive the current and latest", async () => {
      const oldData = { date: new Date(2019, 1, 1), array: ["oldValue1"] };
      await userState.update(() => {
        return oldData;
      });
      const initialData = { date: new Date(2020, 1, 1), array: ["value1", "value2"] };
      await userState.update(() => {
        return initialData;
      });

      await awaitAsync();

      const emissions = trackEmissions(userState.state$);
      await awaitAsync();
      expect(emissions).toEqual([initialData]);

      let emissions2: TestState[];
      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest.fn().mockImplementation(async (key: string, obj: any) => {
        emissions2 = trackEmissions(userState.state$);
        await originalSave(key, obj);
      });

      const val = await userState.update(() => {
        return newData;
      });

      await awaitAsync(10);

      expect(val).toEqual(newData);
      expect(emissions).toEqual([initialData, newData]);
      expect(emissions2).toEqual([initialData, newData]);
    });

    test("subscription during an aborted update should receive the last value", async () => {
      // Seed with interesting data
      const initialData = { date: new Date(2020, 1, 1), array: ["value1", "value2"] };
      await userState.update(() => {
        return initialData;
      });

      await awaitAsync();

      const emissions = trackEmissions(userState.state$);
      await awaitAsync();
      expect(emissions).toEqual([initialData]);

      let emissions2: TestState[];
      const val = await userState.update(
        (state) => {
          return newData;
        },
        {
          shouldUpdate: () => {
            emissions2 = trackEmissions(userState.state$);
            return false;
          },
        },
      );

      await awaitAsync();

      expect(val).toEqual(initialData);
      expect(emissions).toEqual([initialData]);

      expect(emissions2).toEqual([initialData]);
    });

    test("updates should wait until previous update is complete", async () => {
      trackEmissions(userState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest
        .fn()
        .mockImplementationOnce(async (key: string, obj: any) => {
          let resolved = false;
          await Promise.race([
            userState.update(() => {
              // deadlocks
              resolved = true;
              return newData;
            }),
            awaitAsync(100), // limit test to 100ms
          ]);
          expect(resolved).toBe(false);
        })
        .mockImplementation((...args) => {
          return originalSave(...args);
        });

      await userState.update(() => {
        return newData;
      });
    });

    test("updates with FAKE_DEFAULT initial value should resolve correctly", async () => {
      expect(userState["stateSubject"].value).toEqual(anySymbol()); // FAKE_DEFAULT
      const val = await userState.update((state) => {
        return newData;
      });

      expect(val).toEqual(newData);
      const call = diskStorageService.mock.save.mock.calls[0];
      expect(call[0]).toEqual(`user_${userId}_fake_fake`);
      expect(call[1]).toEqual(newData);
    });

    it("does not await updates if the active user changes", async () => {
      const initialUserId = (await firstValueFrom(accountService.activeAccount$)).id;
      expect(initialUserId).toBe(userId);
      trackEmissions(userState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest
        .fn()
        .mockImplementationOnce(async (key: string, obj: any) => {
          let resolved = false;
          await changeActiveUser("2");
          await Promise.race([
            userState.update(() => {
              // should not deadlock because we updated the user
              resolved = true;
              return newData;
            }),
            awaitAsync(100), // limit test to 100ms
          ]);
          expect(resolved).toBe(true);
        })
        .mockImplementation((...args) => {
          return originalSave(...args);
        });

      await userState.update(() => {
        return newData;
      });
    });

    it("stores updates for users in the correct place when active user changes mid-update", async () => {
      trackEmissions(userState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const user2Data = { date: new Date(), array: ["user 2 data"] };

      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest
        .fn()
        .mockImplementationOnce(async (key: string, obj: any) => {
          let resolved = false;
          await changeActiveUser("2");
          await Promise.race([
            userState.update(() => {
              // should not deadlock because we updated the user
              resolved = true;
              return user2Data;
            }),
            awaitAsync(100), // limit test to 100ms
          ]);
          expect(resolved).toBe(true);
          await originalSave(key, obj);
        })
        .mockImplementation((...args) => {
          return originalSave(...args);
        });

      await userState.update(() => {
        return newData;
      });
      await awaitAsync();

      expect(diskStorageService.mock.save).toHaveBeenCalledTimes(2);
      const innerCall = diskStorageService.mock.save.mock.calls[0];
      expect(innerCall[0]).toEqual(`user_${makeUserId("2")}_fake_fake`);
      expect(innerCall[1]).toEqual(user2Data);
      const outerCall = diskStorageService.mock.save.mock.calls[1];
      expect(outerCall[0]).toEqual(`user_${makeUserId("1")}_fake_fake`);
      expect(outerCall[1]).toEqual(newData);
    });
  });

  describe("cleanup", () => {
    const newData = { date: new Date(), array: ["test"] };
    const userId = makeUserId("1");
    let userKey: string;

    beforeEach(async () => {
      await changeActiveUser("1");
      userKey = userKeyBuilder(userId, testKeyDefinition);
    });

    async function assertClean() {
      const emissions = trackEmissions(userState["stateSubject"]);
      const initial = structuredClone(emissions);

      diskStorageService.save(userKey, newData);
      await awaitAsync(); // storage updates are behind a promise

      expect(emissions).toEqual(initial); // no longer listening to storage updates
    }

    it("should cleanup after last subscriber", async () => {
      const subscription = userState.state$.subscribe();
      await awaitAsync(); // storage updates are behind a promise

      subscription.unsubscribe();
      expect(userState["subscriberCount"].getValue()).toBe(0);
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      await assertClean();
    });

    it("should not cleanup if there are still subscribers", async () => {
      const subscription1 = userState.state$.subscribe();
      const sub2Emissions: TestState[] = [];
      const subscription2 = userState.state$.subscribe((v) => sub2Emissions.push(v));
      await awaitAsync(); // storage updates are behind a promise

      subscription1.unsubscribe();

      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(userState["subscriberCount"].getValue()).toBe(1);

      // Still be listening to storage updates
      diskStorageService.save(userKey, newData);
      await awaitAsync(); // storage updates are behind a promise
      expect(sub2Emissions).toEqual([null, newData]);

      subscription2.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      await assertClean();
    });

    it("can re-initialize after cleanup", async () => {
      const subscription = userState.state$.subscribe();
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      const emissions = trackEmissions(userState.state$);
      await awaitAsync();

      diskStorageService.save(userKey, newData);
      await awaitAsync();

      expect(emissions).toEqual([null, newData]);
    });

    it("should not cleanup if a subscriber joins during the cleanup delay", async () => {
      const subscription = userState.state$.subscribe();
      await awaitAsync();

      await diskStorageService.save(userKey, newData);
      await awaitAsync();

      subscription.unsubscribe();
      expect(userState["subscriberCount"].getValue()).toBe(0);
      // Do not wait long enough for cleanup
      await awaitAsync(cleanupDelayMs / 2);

      expect(userState["stateSubject"].value).toEqual(newData); // digging in to check that it hasn't been cleared
      expect(userState["storageUpdateSubscription"]).not.toBeNull(); // still listening to storage updates
    });

    it("state$ observables are durable to cleanup", async () => {
      const observable = userState.state$;
      let subscription = observable.subscribe();

      await diskStorageService.save(userKey, newData);
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      subscription = observable.subscribe();
      await diskStorageService.save(userKey, newData);
      await awaitAsync();

      expect(await firstValueFrom(observable)).toEqual(newData);
    });
  });
});
