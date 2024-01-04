import { of } from "rxjs";

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

  beforeEach(() => {
    activeUserStateProvider = new FakeActiveUserStateProvider();
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
