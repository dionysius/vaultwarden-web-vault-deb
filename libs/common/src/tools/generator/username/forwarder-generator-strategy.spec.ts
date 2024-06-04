import { mock } from "jest-mock-extended";
import { of, firstValueFrom } from "rxjs";

import { FakeStateProvider, mockAccountServiceWith } from "../../../../spec";
import { PolicyType } from "../../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "../../../admin-console/models/domain/policy";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { StateProvider } from "../../../platform/state";
import { UserId } from "../../../types/guid";
import { UserKey } from "../../../types/key";
import { BufferedState } from "../../state/buffered-state";
import { DefaultPolicyEvaluator } from "../default-policy-evaluator";
import { DUCK_DUCK_GO_FORWARDER, DUCK_DUCK_GO_BUFFER } from "../key-definitions";

import { ForwarderGeneratorStrategy } from "./forwarder-generator-strategy";
import { DefaultDuckDuckGoOptions } from "./forwarders/duck-duck-go";
import { ApiOptions } from "./options/forwarder-options";

class TestForwarder extends ForwarderGeneratorStrategy<ApiOptions> {
  constructor(
    encryptService: EncryptService,
    keyService: CryptoService,
    stateProvider: StateProvider,
  ) {
    super(encryptService, keyService, stateProvider, { website: null, token: "" });
  }

  get key() {
    // arbitrary.
    return DUCK_DUCK_GO_FORWARDER;
  }

  get rolloverKey() {
    return DUCK_DUCK_GO_BUFFER;
  }

  defaults$ = (userId: UserId) => {
    return of(DefaultDuckDuckGoOptions);
  };
}

const SomeUser = "some user" as UserId;
const AnotherUser = "another user" as UserId;
const SomePolicy = mock<Policy>({
  type: PolicyType.PasswordGenerator,
  data: {
    minLength: 10,
  },
});

describe("ForwarderGeneratorStrategy", () => {
  const encryptService = mock<EncryptService>();
  const keyService = mock<CryptoService>();
  const stateProvider = new FakeStateProvider(mockAccountServiceWith(SomeUser));

  beforeEach(() => {
    const keyAvailable = of({} as UserKey);
    keyService.getInMemoryUserKeyFor$.mockReturnValue(keyAvailable);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("durableState", () => {
    it("constructs a secret state", () => {
      const strategy = new TestForwarder(encryptService, keyService, stateProvider);

      const result = strategy.durableState(SomeUser);

      expect(result).toBeInstanceOf(BufferedState);
    });

    it("returns the same secret state for a single user", () => {
      const strategy = new TestForwarder(encryptService, keyService, stateProvider);

      const firstResult = strategy.durableState(SomeUser);
      const secondResult = strategy.durableState(SomeUser);

      expect(firstResult).toBe(secondResult);
    });

    it("returns a different secret state for a different user", () => {
      const strategy = new TestForwarder(encryptService, keyService, stateProvider);

      const firstResult = strategy.durableState(SomeUser);
      const secondResult = strategy.durableState(AnotherUser);

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("toEvaluator()", () => {
    it.each([[[]], [null], [undefined], [[SomePolicy]], [[SomePolicy, SomePolicy]]])(
      "should map any input (= %p) to the default policy evaluator",
      async (policies) => {
        const strategy = new TestForwarder(encryptService, keyService, stateProvider);

        const evaluator$ = of(policies).pipe(strategy.toEvaluator());
        const evaluator = await firstValueFrom(evaluator$);

        expect(evaluator).toBeInstanceOf(DefaultPolicyEvaluator);
      },
    );
  });
});
