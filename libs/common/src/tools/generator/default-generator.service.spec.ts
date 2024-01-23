/**
 * include structuredClone in test environment.
 * @jest-environment ../../../../shared/test.environment.ts
 */

import { mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { FakeActiveUserStateProvider, mockAccountServiceWith } from "../../../spec";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "../../admin-console/models/domain/policy";
import { Utils } from "../../platform/misc/utils";
import { ActiveUserState, ActiveUserStateProvider, KeyDefinition } from "../../platform/state";
import { UserId } from "../../types/guid";

import { GeneratorStrategy, PolicyEvaluator } from "./abstractions";
import { PASSPHRASE_SETTINGS, PASSWORD_SETTINGS } from "./key-definitions";
import { PasswordGenerationOptions } from "./password";

import { DefaultGeneratorService } from ".";

function mockPolicyService(config?: { data?: any; policy?: BehaviorSubject<Policy> }) {
  const state = mock<Policy>({ data: config?.data ?? {} });
  const subject = config?.policy ?? new BehaviorSubject<Policy>(state);

  const service = mock<PolicyService>();
  service.get$.mockReturnValue(subject.asObservable());

  return service;
}

function mockGeneratorStrategy(config?: {
  disk?: KeyDefinition<any>;
  policy?: PolicyType;
  evaluator?: any;
}) {
  const strategy = mock<GeneratorStrategy<any, any>>({
    // intentionally arbitrary so that tests that need to check
    // whether they're used properly are guaranteed to test
    // the value from `config`.
    disk: config?.disk ?? {},
    policy: config?.policy ?? PolicyType.DisableSend,
    evaluator: jest.fn(() => config?.evaluator ?? mock<PolicyEvaluator<any, any>>()),
  });

  return strategy;
}

// FIXME: Use the fake instead, once it's updated to monitor its method calls.
function mockStateProvider(): [
  ActiveUserStateProvider,
  ActiveUserState<PasswordGenerationOptions>,
] {
  const state = mock<ActiveUserState<PasswordGenerationOptions>>();
  const provider = mock<ActiveUserStateProvider>();
  provider.get.mockReturnValue(state);

  return [provider, state];
}

function fakeStateProvider(key: KeyDefinition<any>, initalValue: any): FakeActiveUserStateProvider {
  const userId = Utils.newGuid() as UserId;
  const acctService = mockAccountServiceWith(userId);
  const provider = new FakeActiveUserStateProvider(acctService);
  provider.mockFor(key.key, initalValue);
  return provider;
}

describe("Password generator service", () => {
  describe("constructor()", () => {
    it("should initialize the password generator policy", () => {
      const policy = mockPolicyService();
      const strategy = mockGeneratorStrategy({ policy: PolicyType.PasswordGenerator });

      new DefaultGeneratorService(strategy, policy, null);

      expect(policy.get$).toHaveBeenCalledWith(PolicyType.PasswordGenerator);
    });
  });

  describe("options$", () => {
    it("should return the state from strategy.key", () => {
      const policy = mockPolicyService();
      const strategy = mockGeneratorStrategy({ disk: PASSPHRASE_SETTINGS });
      const [state] = mockStateProvider();
      const service = new DefaultGeneratorService(strategy, policy, state);

      // invoke the getter. It returns the state but that's not important.
      service.options$;

      expect(state.get).toHaveBeenCalledWith(PASSPHRASE_SETTINGS);
    });
  });

  describe("saveOptions()", () => {
    it("should update the state at strategy.key", async () => {
      const policy = mockPolicyService();
      const [provider, state] = mockStateProvider();
      const strategy = mockGeneratorStrategy({ disk: PASSWORD_SETTINGS });
      const service = new DefaultGeneratorService(strategy, policy, provider);

      await service.saveOptions({});

      expect(provider.get).toHaveBeenCalledWith(PASSWORD_SETTINGS);
      expect(state.update).toHaveBeenCalled();
    });

    it("should trigger an options$ update", async () => {
      const policy = mockPolicyService();
      const strategy = mockGeneratorStrategy();
      // using the fake here because we're testing that the update and the
      // property are wired together. If we were to mock that, we'd be testing
      // the mock configuration instead of the wiring.
      const provider = fakeStateProvider(strategy.disk, { length: 9 });
      const service = new DefaultGeneratorService(strategy, policy, provider);

      await service.saveOptions({ length: 10 });

      const options = await firstValueFrom(service.options$);
      expect(options).toEqual({ length: 10 });
    });
  });

  describe("policy$", () => {
    it("should map the policy using the generation strategy", async () => {
      const policyService = mockPolicyService();
      const evaluator = mock<PolicyEvaluator<any, any>>();
      const strategy = mockGeneratorStrategy({ evaluator });

      const service = new DefaultGeneratorService(strategy, policyService, null);

      const policy = await firstValueFrom(service.policy$);

      expect(policy).toBe(evaluator);
    });
  });

  describe("enforcePolicy()", () => {
    describe("should load the policy", () => {
      it("from the cache by default", async () => {
        const policy = mockPolicyService();
        const strategy = mockGeneratorStrategy();
        const service = new DefaultGeneratorService(strategy, policy, null);

        await service.enforcePolicy({});
        await service.enforcePolicy({});

        expect(strategy.evaluator).toHaveBeenCalledTimes(1);
      });

      it("from the policy service when the policy changes", async () => {
        const policy = new BehaviorSubject<Policy>(mock<Policy>({ data: {} }));
        const policyService = mockPolicyService({ policy });
        const strategy = mockGeneratorStrategy();
        const service = new DefaultGeneratorService(strategy, policyService, null);

        await service.enforcePolicy({});
        policy.next(mock<Policy>({ data: { some: "change" } }));
        await service.enforcePolicy({});

        expect(strategy.evaluator).toHaveBeenCalledTimes(2);
      });
    });

    it("should evaluate the policy using the generation strategy", async () => {
      const policy = mockPolicyService();
      const evaluator = mock<PolicyEvaluator<any, any>>();
      const strategy = mockGeneratorStrategy({ evaluator });
      const service = new DefaultGeneratorService(strategy, policy, null);

      await service.enforcePolicy({});

      expect(evaluator.applyPolicy).toHaveBeenCalled();
      expect(evaluator.sanitize).toHaveBeenCalled();
    });
  });

  describe("generate()", () => {
    it("should invoke the generation strategy", async () => {
      const strategy = mockGeneratorStrategy();
      const policy = mockPolicyService();
      const service = new DefaultGeneratorService(strategy, policy, null);

      await service.generate({});

      expect(strategy.generate).toHaveBeenCalled();
    });
  });
});
