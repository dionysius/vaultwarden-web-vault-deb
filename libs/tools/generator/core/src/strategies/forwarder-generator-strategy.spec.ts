import { mock } from "jest-mock-extended";
import { of, firstValueFrom } from "rxjs";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { BufferedState } from "@bitwarden/common/tools/state/buffered-state";
import { UserId } from "@bitwarden/common/types/guid";
import { UserKey } from "@bitwarden/common/types/key";

import { FakeStateProvider, mockAccountServiceWith } from "../../../../../common/spec";
import { DefaultDuckDuckGoOptions } from "../data";
import { DefaultPolicyEvaluator } from "../policies";
import { ApiOptions } from "../types";

import { ForwarderGeneratorStrategy } from "./forwarder-generator-strategy";
import { DUCK_DUCK_GO_FORWARDER, DUCK_DUCK_GO_BUFFER } from "./storage";

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
