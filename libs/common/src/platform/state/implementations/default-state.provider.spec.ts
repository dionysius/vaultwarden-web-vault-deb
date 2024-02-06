import { of } from "rxjs";

import { FakeAccountService, mockAccountServiceWith } from "../../../../spec/fake-account-service";
import {
  FakeActiveUserStateProvider,
  FakeDerivedStateProvider,
  FakeGlobalStateProvider,
  FakeSingleUserStateProvider,
} from "../../../../spec/fake-state-provider";
import { UserId } from "../../../types/guid";
import { DeriveDefinition } from "../derive-definition";
import { KeyDefinition } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultStateProvider } from "./default-state.provider";

describe("DefaultStateProvider", () => {
  let sut: DefaultStateProvider;
  let activeUserStateProvider: FakeActiveUserStateProvider;
  let singleUserStateProvider: FakeSingleUserStateProvider;
  let globalStateProvider: FakeGlobalStateProvider;
  let derivedStateProvider: FakeDerivedStateProvider;
  let accountService: FakeAccountService;
  const userId = "fakeUserId" as UserId;

  beforeEach(() => {
    accountService = mockAccountServiceWith(userId);
    activeUserStateProvider = new FakeActiveUserStateProvider(accountService);
    singleUserStateProvider = new FakeSingleUserStateProvider();
    globalStateProvider = new FakeGlobalStateProvider();
    derivedStateProvider = new FakeDerivedStateProvider();
    sut = new DefaultStateProvider(
      activeUserStateProvider,
      singleUserStateProvider,
      globalStateProvider,
      derivedStateProvider,
    );
  });

  describe("activeUserId$", () => {
    it("should track the active User id from active user state provider", () => {
      expect(sut.activeUserId$).toBe(activeUserStateProvider.activeUserId$);
    });
  });

  describe("getUserState$", () => {
    const keyDefinition = new KeyDefinition<string>(new StateDefinition("test", "disk"), "test", {
      deserializer: (s) => s,
    });

    it("should get the state for the active user if no userId is provided", () => {
      const state = sut.getUserState$(keyDefinition);
      expect(state).toBe(activeUserStateProvider.get(keyDefinition).state$);
    });

    it("should not return state for a single user if no userId is provided", () => {
      const state = sut.getUserState$(keyDefinition);
      expect(state).not.toBe(singleUserStateProvider.get(userId, keyDefinition).state$);
    });

    it("should get the state for the provided userId", () => {
      const userId = "user" as UserId;
      const state = sut.getUserState$(keyDefinition, userId);
      expect(state).toBe(singleUserStateProvider.get(userId, keyDefinition).state$);
    });

    it("should not get the active user state if userId is provided", () => {
      const userId = "user" as UserId;
      const state = sut.getUserState$(keyDefinition, userId);
      expect(state).not.toBe(activeUserStateProvider.get(keyDefinition).state$);
    });
  });

  describe("setUserState", () => {
    const keyDefinition = new KeyDefinition<string>(new StateDefinition("test", "disk"), "test", {
      deserializer: (s) => s,
    });

    it("should set the state for the active user if no userId is provided", async () => {
      const value = "value";
      await sut.setUserState(keyDefinition, value);
      const state = activeUserStateProvider.getFake(keyDefinition);
      expect(state.nextMock).toHaveBeenCalledWith([expect.any(String), value]);
    });

    it("should not set state for a single user if no userId is provided", async () => {
      const value = "value";
      await sut.setUserState(keyDefinition, value);
      const state = singleUserStateProvider.getFake(userId, keyDefinition);
      expect(state.nextMock).not.toHaveBeenCalled();
    });

    it("should set the state for the provided userId", async () => {
      const value = "value";
      await sut.setUserState(keyDefinition, value, userId);
      const state = singleUserStateProvider.getFake(userId, keyDefinition);
      expect(state.nextMock).toHaveBeenCalledWith(value);
    });

    it("should not set the active user state if userId is provided", async () => {
      const value = "value";
      await sut.setUserState(keyDefinition, value, userId);
      const state = activeUserStateProvider.getFake(keyDefinition);
      expect(state.nextMock).not.toHaveBeenCalled();
    });
  });

  it("should bind the activeUserStateProvider", () => {
    const keyDefinition = new KeyDefinition(new StateDefinition("test", "disk"), "test", {
      deserializer: () => null,
    });
    const existing = activeUserStateProvider.get(keyDefinition);
    const actual = sut.getActive(keyDefinition);
    expect(actual).toBe(existing);
  });

  it("should bind the singleUserStateProvider", () => {
    const userId = "user" as UserId;
    const keyDefinition = new KeyDefinition(new StateDefinition("test", "disk"), "test", {
      deserializer: () => null,
    });
    const existing = singleUserStateProvider.get(userId, keyDefinition);
    const actual = sut.getUser(userId, keyDefinition);
    expect(actual).toBe(existing);
  });

  it("should bind the globalStateProvider", () => {
    const keyDefinition = new KeyDefinition(new StateDefinition("test", "disk"), "test", {
      deserializer: () => null,
    });
    const existing = globalStateProvider.get(keyDefinition);
    const actual = sut.getGlobal(keyDefinition);
    expect(actual).toBe(existing);
  });

  it("should bind the derivedStateProvider", () => {
    const derivedDefinition = new DeriveDefinition(new StateDefinition("test", "disk"), "test", {
      derive: () => null,
      deserializer: () => null,
    });
    const parentState$ = of(null);
    const existing = derivedStateProvider.get(parentState$, derivedDefinition, {});
    const actual = sut.getDerived(parentState$, derivedDefinition, {});
    expect(actual).toBe(existing);
  });
});
