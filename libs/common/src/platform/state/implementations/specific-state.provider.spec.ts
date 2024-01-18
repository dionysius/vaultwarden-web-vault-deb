import { mockAccountServiceWith } from "../../../../spec/fake-account-service";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { UserId } from "../../../types/guid";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultActiveUserState } from "./default-active-user-state";
import { DefaultActiveUserStateProvider } from "./default-active-user-state.provider";
import { DefaultGlobalState } from "./default-global-state";
import { DefaultGlobalStateProvider } from "./default-global-state.provider";
import { DefaultSingleUserState } from "./default-single-user-state";
import { DefaultSingleUserStateProvider } from "./default-single-user-state.provider";

describe("Specific State Providers", () => {
  let singleSut: DefaultSingleUserStateProvider;
  let activeSut: DefaultActiveUserStateProvider;
  let globalSut: DefaultGlobalStateProvider;

  const fakeUser1 = "00000000-0000-1000-a000-000000000001" as UserId;

  beforeEach(() => {
    singleSut = new DefaultSingleUserStateProvider(
      new FakeStorageService() as any,
      new FakeStorageService(),
    );
    activeSut = new DefaultActiveUserStateProvider(
      mockAccountServiceWith(null),
      new FakeStorageService() as any,
      new FakeStorageService(),
    );
    globalSut = new DefaultGlobalStateProvider(
      new FakeStorageService() as any,
      new FakeStorageService(),
    );
  });

  const fakeDiskStateDefinition = new StateDefinition("fake", "disk");
  const fakeAlternateDiskStateDefinition = new StateDefinition("fakeAlternate", "disk");
  const fakeMemoryStateDefinition = new StateDefinition("fake", "memory");

  const fakeDiskKeyDefinition = new KeyDefinition<boolean>(fakeDiskStateDefinition, "fake", {
    deserializer: (b) => b,
  });
  const fakeAlternateKeyDefinition = new KeyDefinition<boolean>(
    fakeAlternateDiskStateDefinition,
    "fake",
    {
      deserializer: (b) => b,
    },
  );
  const fakeMemoryKeyDefinition = new KeyDefinition<boolean>(fakeMemoryStateDefinition, "fake", {
    deserializer: (b) => b,
  });
  const fakeDiskKeyDefinitionAlternate = new KeyDefinition<boolean>(
    fakeDiskStateDefinition,
    "fakeAlternate",
    {
      deserializer: (b) => b,
    },
  );

  describe.each([
    {
      // Use a static user id so that it has the same signature as the rest and then write special tests
      // handling differing user id
      getMethod: (keyDefinition: KeyDefinition<boolean>) => singleSut.get(fakeUser1, keyDefinition),
      expectedInstance: DefaultSingleUserState,
    },
    {
      getMethod: (keyDefinition: KeyDefinition<boolean>) => activeSut.get(keyDefinition),
      expectedInstance: DefaultActiveUserState,
    },
    {
      getMethod: (keyDefinition: KeyDefinition<boolean>) => globalSut.get(keyDefinition),
      expectedInstance: DefaultGlobalState,
    },
  ])("common behavior %s", ({ getMethod, expectedInstance }) => {
    it("returns expected instance", () => {
      const state = getMethod(fakeDiskKeyDefinition);

      expect(state).toBeTruthy();
      expect(state).toBeInstanceOf(expectedInstance);
    });

    it("returns cached instance on repeated request", () => {
      const stateFirst = getMethod(fakeDiskKeyDefinition);
      const stateCached = getMethod(fakeDiskKeyDefinition);
      expect(stateFirst).toStrictEqual(stateCached);
    });

    it("returns different instances when the storage location differs", () => {
      const stateDisk = getMethod(fakeDiskKeyDefinition);
      const stateMemory = getMethod(fakeMemoryKeyDefinition);
      expect(stateDisk).not.toStrictEqual(stateMemory);
    });

    it("returns different instances when the state name differs", () => {
      const state = getMethod(fakeDiskKeyDefinition);
      const stateAlt = getMethod(fakeAlternateKeyDefinition);
      expect(state).not.toStrictEqual(stateAlt);
    });

    it("returns different instances when the key differs", () => {
      const state = getMethod(fakeDiskKeyDefinition);
      const stateAlt = getMethod(fakeDiskKeyDefinitionAlternate);
      expect(state).not.toStrictEqual(stateAlt);
    });
  });

  describe("DefaultSingleUserStateProvider only behavior", () => {
    const fakeUser2 = "00000000-0000-1000-a000-000000000002" as UserId;

    it("returns different instances when the user id differs", () => {
      const user1State = singleSut.get(fakeUser1, fakeDiskKeyDefinition);
      const user2State = singleSut.get(fakeUser2, fakeDiskKeyDefinition);
      expect(user1State).not.toStrictEqual(user2State);
    });

    it("returns an instance with the userId property corresponding to the user id passed in", () => {
      const userState = singleSut.get(fakeUser1, fakeDiskKeyDefinition);
      expect(userState.userId).toBe(fakeUser1);
    });
  });
});
