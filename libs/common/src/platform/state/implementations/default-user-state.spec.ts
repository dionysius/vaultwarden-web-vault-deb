/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */
import { any, mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, of, timeout } from "rxjs";
import { Jsonify } from "type-fest";

import { awaitAsync, trackEmissions } from "../../../../spec";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { AccountInfo, AccountService } from "../../../auth/abstractions/account.service";
import { AuthenticationStatus } from "../../../auth/enums/authentication-status";
import { UserId } from "../../../types/guid";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultUserState } from "./default-user-state";

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

const testKeyDefinition = new KeyDefinition<TestState>(testStateDefinition, "fake", {
  deserializer: TestState.fromJSON,
});

describe("DefaultUserState", () => {
  const accountService = mock<AccountService>();
  let diskStorageService: FakeStorageService;
  let activeAccountSubject: BehaviorSubject<{ id: UserId } & AccountInfo>;
  let userState: DefaultUserState<TestState>;

  beforeEach(() => {
    activeAccountSubject = new BehaviorSubject<{ id: UserId } & AccountInfo>(undefined);
    accountService.activeAccount$ = activeAccountSubject;

    diskStorageService = new FakeStorageService();
    userState = new DefaultUserState(
      testKeyDefinition,
      accountService,
      null, // Not testing anything with encrypt service
      diskStorageService
    );
  });

  const changeActiveUser = async (id: string) => {
    const userId = id != null ? `00000000-0000-1000-a000-00000000000${id}` : undefined;
    activeAccountSubject.next({
      id: userId as UserId,
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
    changeActiveUser("1");
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
      any()
    );
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      2,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      any()
    );
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      3,
      "user_00000000-0000-1000-a000-000000000002_fake_fake",
      any()
    );

    // Should only have saved data for the first user
    expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
    expect(diskStorageService.mock.save).toHaveBeenNthCalledWith(
      1,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      any()
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
    diskStorageService.internalUpdateStore({
      "user_00000000-0000-1000-a000-000000000001_fake_fake": {
        date: "2020-09-21T13:14:17.648Z",
        array: ["value"],
      } as Jsonify<TestState>,
      "user_00000000-0000-1000-a000-000000000002_fake_fake": {
        date: "2020-09-21T13:14:17.648Z",
        array: [],
      } as Jsonify<TestState>,
    });

    // This starts one subscription on the observable for tracking emissions throughout
    // the whole test.
    const emissions = trackEmissions(userState.state$);

    // Change to a user with data
    await changeActiveUser("1");

    // This should always return a value right await
    const value = await firstValueFrom(userState.state$);
    expect(value).toBeTruthy();

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

    expect(resolvedValue).toBeFalsy();
    expect(rejectedError).toBeTruthy();
    expect(rejectedError.message).toBe("Timeout has occurred");

    // We need to figure out if something should be emitted
    // when there becomes no active user, if we don't want that to emit
    // this value is correct.
    expect(emissions).toHaveLength(2);
  });

  describe("update", () => {
    const newData = { date: new Date(), array: ["test"] };
    beforeEach(async () => {
      changeActiveUser("1");
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
        }
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
        }
      );

      await awaitAsync();

      expect(diskStorageService.mock.save).not.toHaveBeenCalled();
      expect(result).toBe(undefined);
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
});
