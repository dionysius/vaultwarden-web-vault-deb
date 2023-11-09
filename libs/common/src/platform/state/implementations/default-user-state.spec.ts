import { any, mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom, timeout } from "rxjs";
import { Jsonify } from "type-fest";

import { trackEmissions } from "../../../../spec";
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

const testKeyDefinition = new KeyDefinition<TestState>(
  testStateDefinition,
  "fake",
  TestState.fromJSON
);

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
    await new Promise((resolve) => setTimeout(resolve, 1));
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("emits updates for each user switch and update", async () => {
    diskStorageService.internalUpdateStore({
      "user_00000000-0000-1000-a000-000000000001_fake_fake": {
        date: "2022-09-21T13:14:17.648Z",
        array: ["value1", "value2"],
      } as Jsonify<TestState>,
      "user_00000000-0000-1000-a000-000000000002_fake_fake": {
        date: "2021-09-21T13:14:17.648Z",
        array: ["user2_value"],
      },
    });

    const emissions = trackEmissions(userState.state$);

    // User signs in
    changeActiveUser("1");
    await new Promise<void>((resolve) => setTimeout(resolve, 1));

    // Service does an update
    await userState.update((state) => {
      state.array.push("value3");
      state.date = new Date(2023, 0);
      return state;
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 1));

    // Emulate an account switch
    await changeActiveUser("2");

    expect(emissions).toHaveLength(3);
    // Gotten starter user data
    expect(emissions[0]).toBeTruthy();
    expect(emissions[0].array).toHaveLength(2);

    // Gotten emission for the update call
    expect(emissions[1]).toBeTruthy();
    expect(emissions[1].array).toHaveLength(3);
    expect(new Date(emissions[1].date).getUTCFullYear()).toBe(2023);

    // The second users data
    expect(emissions[2]).toBeTruthy();
    expect(emissions[2].array).toHaveLength(1);
    expect(new Date(emissions[2].date).getUTCFullYear()).toBe(2021);

    // Should only be called twice to get state, once for each user
    expect(diskStorageService.mock.get).toHaveBeenCalledTimes(2);
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      1,
      "user_00000000-0000-1000-a000-000000000001_fake_fake",
      any()
    );
    expect(diskStorageService.mock.get).toHaveBeenNthCalledWith(
      2,
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
        date: "2020-09-21T13:14:17.648Z",
        array: ["testValue"],
      } as Jsonify<TestState>,
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
});
