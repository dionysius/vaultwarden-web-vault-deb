import { mock } from "jest-mock-extended";
import { BehaviorSubject, filter, firstValueFrom, Subject } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { GENERATOR_DISK, UserKeyDefinition } from "@bitwarden/common/platform/state";
import { Constraints } from "@bitwarden/common/tools/types";
import { OrganizationId, PolicyId, UserId } from "@bitwarden/common/types/guid";

import {
  FakeStateProvider,
  FakeAccountService,
  awaitAsync,
  ObservableTracker,
} from "../../../../../common/spec";
import { PolicyEvaluator, Randomizer } from "../abstractions";
import { CredentialGeneratorConfiguration, GeneratedCredential } from "../types";

import { CredentialGeneratorService } from "./credential-generator.service";

// arbitrary settings types
type SomeSettings = { foo: string };
type SomePolicy = { fooPolicy: boolean };

// settings storage location
const SettingsKey = new UserKeyDefinition<SomeSettings>(GENERATOR_DISK, "SomeSettings", {
  deserializer: (value) => value,
  clearOn: [],
});

// fake policy
const policyService = mock<PolicyService>();
const somePolicy = new Policy({
  data: { fooPolicy: true },
  type: PolicyType.PasswordGenerator,
  id: "" as PolicyId,
  organizationId: "" as OrganizationId,
  enabled: true,
});

const SomeTime = new Date(1);
const SomeCategory = "passphrase";

// fake the configuration
const SomeConfiguration: CredentialGeneratorConfiguration<SomeSettings, SomePolicy> = {
  category: SomeCategory,
  engine: {
    create: (randomizer) => {
      return {
        generate: (request, settings) => {
          const credential = request.website ? `${request.website}|${settings.foo}` : settings.foo;
          const result = new GeneratedCredential(credential, SomeCategory, SomeTime);
          return Promise.resolve(result);
        },
      };
    },
  },
  settings: {
    initial: { foo: "initial" },
    constraints: { foo: {} },
    account: SettingsKey,
  },
  policy: {
    type: PolicyType.PasswordGenerator,
    disabledValue: {
      fooPolicy: false,
    },
    combine: (acc, policy) => {
      return { fooPolicy: acc.fooPolicy || policy.data.fooPolicy };
    },
    createEvaluator: () => {
      throw new Error("this should never be called");
    },
    createEvaluatorV2: (policy) => {
      return {
        foo: {},
        policy,
        policyInEffect: policy.fooPolicy,
        applyPolicy: (settings) => {
          return policy.fooPolicy ? { foo: `apply(${settings.foo})` } : settings;
        },
        sanitize: (settings) => {
          return policy.fooPolicy ? { foo: `sanitize(${settings.foo})` } : settings;
        },
      } as PolicyEvaluator<SomePolicy, SomeSettings> & Constraints<SomeSettings>;
    },
  },
};

// fake user information
const SomeUser = "SomeUser" as UserId;
const AnotherUser = "SomeOtherUser" as UserId;
const accountService = new FakeAccountService({
  [SomeUser]: {
    name: "some user",
    email: "some.user@example.com",
    emailVerified: true,
  },
  [AnotherUser]: {
    name: "some other user",
    email: "some.other.user@example.com",
    emailVerified: true,
  },
});

// fake state
const stateProvider = new FakeStateProvider(accountService);

// fake randomizer
const randomizer = mock<Randomizer>();

describe("CredentialGeneratorService", () => {
  beforeEach(async () => {
    await accountService.switchAccount(SomeUser);
    policyService.getAll$.mockImplementation(() => new BehaviorSubject([]).asObservable());
    jest.clearAllMocks();
  });

  describe("generate$", () => {
    it("emits a generation for the active user when subscribed", async () => {
      const settings = { foo: "value" };
      await stateProvider.setUserState(SettingsKey, settings, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration));

      const result = await generated.expectEmission();

      expect(result).toEqual(new GeneratedCredential("value", SomeCategory, SomeTime));
    });

    it("follows the active user", async () => {
      const someSettings = { foo: "some value" };
      const anotherSettings = { foo: "another value" };
      await stateProvider.setUserState(SettingsKey, someSettings, SomeUser);
      await stateProvider.setUserState(SettingsKey, anotherSettings, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration));

      await accountService.switchAccount(AnotherUser);
      await generated.pauseUntilReceived(2);
      generated.unsubscribe();

      expect(generated.emissions).toEqual([
        new GeneratedCredential("some value", SomeCategory, SomeTime),
        new GeneratedCredential("another value", SomeCategory, SomeTime),
      ]);
    });

    it("emits a generation when the settings change", async () => {
      const someSettings = { foo: "some value" };
      const anotherSettings = { foo: "another value" };
      await stateProvider.setUserState(SettingsKey, someSettings, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration));

      await stateProvider.setUserState(SettingsKey, anotherSettings, SomeUser);
      await generated.pauseUntilReceived(2);
      generated.unsubscribe();

      expect(generated.emissions).toEqual([
        new GeneratedCredential("some value", SomeCategory, SomeTime),
        new GeneratedCredential("another value", SomeCategory, SomeTime),
      ]);
    });

    // FIXME: test these when the fake state provider can create the required emissions
    it.todo("errors when the settings error");
    it.todo("completes when the settings complete");

    it("includes `website$`'s last emitted value", async () => {
      const settings = { foo: "value" };
      await stateProvider.setUserState(SettingsKey, settings, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const website$ = new BehaviorSubject("some website");
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration, { website$ }));

      const result = await generated.expectEmission();

      expect(result).toEqual(new GeneratedCredential("some website|value", SomeCategory, SomeTime));
    });

    it("errors when `website$` errors", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const website$ = new BehaviorSubject("some website");
      let error = null;

      generator.generate$(SomeConfiguration, { website$ }).subscribe({
        error: (e: unknown) => {
          error = e;
        },
      });
      website$.error({ some: "error" });
      await awaitAsync();

      expect(error).toEqual({ some: "error" });
    });

    it("completes when `website$` completes", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const website$ = new BehaviorSubject("some website");
      let completed = false;

      generator.generate$(SomeConfiguration, { website$ }).subscribe({
        complete: () => {
          completed = true;
        },
      });
      website$.complete();
      await awaitAsync();

      expect(completed).toBeTruthy();
    });

    it("emits a generation for a specific user when `user$` supplied", async () => {
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      await stateProvider.setUserState(SettingsKey, { foo: "another" }, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(AnotherUser).asObservable();
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration, { userId$ }));

      const result = await generated.expectEmission();

      expect(result).toEqual(new GeneratedCredential("another", SomeCategory, SomeTime));
    });

    it("emits a generation for a specific user when `user$` emits", async () => {
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      await stateProvider.setUserState(SettingsKey, { foo: "another" }, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.pipe(filter((u) => !!u));
      const generated = new ObservableTracker(generator.generate$(SomeConfiguration, { userId$ }));

      userId.next(AnotherUser);
      const result = await generated.pauseUntilReceived(2);

      expect(result).toEqual([
        new GeneratedCredential("value", SomeCategory, SomeTime),
        new GeneratedCredential("another", SomeCategory, SomeTime),
      ]);
    });

    it("errors when `user$` errors", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(SomeUser);
      let error = null;

      generator.generate$(SomeConfiguration, { userId$ }).subscribe({
        error: (e: unknown) => {
          error = e;
        },
      });
      userId$.error({ some: "error" });
      await awaitAsync();

      expect(error).toEqual({ some: "error" });
    });

    it("completes when `user$` completes", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(SomeUser);
      let completed = false;

      generator.generate$(SomeConfiguration, { userId$ }).subscribe({
        complete: () => {
          completed = true;
        },
      });
      userId$.complete();
      await awaitAsync();

      expect(completed).toBeTruthy();
    });

    it("emits a generation only when `on$` emits", async () => {
      // This test breaks from arrange/act/assert because it is testing causality
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const on$ = new Subject<void>();
      const results: any[] = [];

      // confirm no emission during subscription
      const sub = generator
        .generate$(SomeConfiguration, { on$ })
        .subscribe((result) => results.push(result));
      await awaitAsync();
      expect(results.length).toEqual(0);

      // confirm forwarded emission
      on$.next();
      await awaitAsync();
      expect(results).toEqual([new GeneratedCredential("value", SomeCategory, SomeTime)]);

      // confirm updating settings does not cause an emission
      await stateProvider.setUserState(SettingsKey, { foo: "next" }, SomeUser);
      await awaitAsync();
      expect(results.length).toBe(1);

      // confirm forwarded emission takes latest value
      on$.next();
      await awaitAsync();
      sub.unsubscribe();

      expect(results).toEqual([
        new GeneratedCredential("value", SomeCategory, SomeTime),
        new GeneratedCredential("next", SomeCategory, SomeTime),
      ]);
    });

    it("errors when `on$` errors", async () => {
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const on$ = new Subject<void>();
      let error: any = null;

      // confirm no emission during subscription
      generator.generate$(SomeConfiguration, { on$ }).subscribe({
        error: (e: unknown) => {
          error = e;
        },
      });
      on$.error({ some: "error" });
      await awaitAsync();

      expect(error).toEqual({ some: "error" });
    });

    it("completes when `on$` completes", async () => {
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const on$ = new Subject<void>();
      let complete = false;

      // confirm no emission during subscription
      generator.generate$(SomeConfiguration, { on$ }).subscribe({
        complete: () => {
          complete = true;
        },
      });
      on$.complete();
      await awaitAsync();

      expect(complete).toBeTruthy();
    });
  });

  describe("settings$", () => {
    it("defaults to the configuration's initial settings if settings aren't found", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);

      const result = await firstValueFrom(generator.settings$(SomeConfiguration));

      expect(result).toEqual(SomeConfiguration.settings.initial);
    });

    it("reads from the active user's configuration-defined storage", async () => {
      const settings = { foo: "value" };
      await stateProvider.setUserState(SettingsKey, settings, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);

      const result = await firstValueFrom(generator.settings$(SomeConfiguration));

      expect(result).toEqual(settings);
    });

    it("applies policy to the loaded settings", async () => {
      const settings = { foo: "value" };
      await stateProvider.setUserState(SettingsKey, settings, SomeUser);
      const policy$ = new BehaviorSubject([somePolicy]);
      policyService.getAll$.mockReturnValue(policy$);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);

      const result = await firstValueFrom(generator.settings$(SomeConfiguration));

      expect(result).toEqual({ foo: "sanitize(apply(value))" });
    });

    it("follows changes to the active user", async () => {
      const someSettings = { foo: "value" };
      const anotherSettings = { foo: "another" };
      await stateProvider.setUserState(SettingsKey, someSettings, SomeUser);
      await stateProvider.setUserState(SettingsKey, anotherSettings, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const results: any = [];
      const sub = generator.settings$(SomeConfiguration).subscribe((r) => results.push(r));

      await accountService.switchAccount(AnotherUser);
      await awaitAsync();
      sub.unsubscribe();

      const [someResult, anotherResult] = results;
      expect(someResult).toEqual(someSettings);
      expect(anotherResult).toEqual(anotherSettings);
    });

    it("reads an arbitrary user's settings", async () => {
      await stateProvider.setUserState(SettingsKey, { foo: "value" }, SomeUser);
      const anotherSettings = { foo: "another" };
      await stateProvider.setUserState(SettingsKey, anotherSettings, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(AnotherUser).asObservable();

      const result = await firstValueFrom(generator.settings$(SomeConfiguration, { userId$ }));

      expect(result).toEqual(anotherSettings);
    });

    it("follows changes to the arbitrary user", async () => {
      const someSettings = { foo: "value" };
      await stateProvider.setUserState(SettingsKey, someSettings, SomeUser);
      const anotherSettings = { foo: "another" };
      await stateProvider.setUserState(SettingsKey, anotherSettings, AnotherUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      const results: any = [];
      const sub = generator
        .settings$(SomeConfiguration, { userId$ })
        .subscribe((r) => results.push(r));

      userId.next(AnotherUser);
      await awaitAsync();
      sub.unsubscribe();

      const [someResult, anotherResult] = results;
      expect(someResult).toEqual(someSettings);
      expect(anotherResult).toEqual(anotherSettings);
    });

    it("errors when the arbitrary user's stream errors", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      let error = null;

      generator.settings$(SomeConfiguration, { userId$ }).subscribe({
        error: (e: unknown) => {
          error = e;
        },
      });
      userId.error({ some: "error" });
      await awaitAsync();

      expect(error).toEqual({ some: "error" });
    });

    it("completes when the arbitrary user's stream completes", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      let completed = false;

      generator.settings$(SomeConfiguration, { userId$ }).subscribe({
        complete: () => {
          completed = true;
        },
      });
      userId.complete();
      await awaitAsync();

      expect(completed).toBeTruthy();
    });

    it("ignores repeated arbitrary user emissions", async () => {
      await stateProvider.setUserState(SettingsKey, null, SomeUser);
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      let count = 0;

      const sub = generator.settings$(SomeConfiguration, { userId$ }).subscribe({
        next: () => {
          count++;
        },
      });
      await awaitAsync();
      userId.next(SomeUser);
      await awaitAsync();
      userId.next(SomeUser);
      await awaitAsync();
      sub.unsubscribe();

      expect(count).toEqual(1);
    });
  });

  describe("settings", () => {
    it("writes to the user's state", async () => {
      const singleUserId$ = new BehaviorSubject(SomeUser).asObservable();
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const subject = await generator.settings(SomeConfiguration, { singleUserId$ });

      subject.next({ foo: "next value" });
      await awaitAsync();
      const result = await firstValueFrom(stateProvider.getUserState$(SettingsKey, SomeUser));

      expect(result).toEqual({ foo: "next value" });
    });

    it("waits for the user to become available", async () => {
      const singleUserId = new BehaviorSubject(null);
      const singleUserId$ = singleUserId.asObservable();
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);

      let completed = false;
      const promise = generator.settings(SomeConfiguration, { singleUserId$ }).then((settings) => {
        completed = true;
        return settings;
      });
      await awaitAsync();
      expect(completed).toBeFalsy();
      singleUserId.next(SomeUser);
      const result = await promise;

      expect(result.userId).toEqual(SomeUser);
    });
  });

  describe("policy$", () => {
    it("creates a disabled policy evaluator when there is no policy", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(SomeUser).asObservable();

      const result = await firstValueFrom(generator.policy$(SomeConfiguration, { userId$ }));

      expect(result.policy).toEqual(SomeConfiguration.policy.disabledValue);
      expect(result.policyInEffect).toBeFalsy();
    });

    it("creates an active policy evaluator when there is a policy", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId$ = new BehaviorSubject(SomeUser).asObservable();
      const policy$ = new BehaviorSubject([somePolicy]);
      policyService.getAll$.mockReturnValue(policy$);

      const result = await firstValueFrom(generator.policy$(SomeConfiguration, { userId$ }));

      expect(result.policy).toEqual({ fooPolicy: true });
      expect(result.policyInEffect).toBeTruthy();
    });

    it("follows policy emissions", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      const somePolicySubject = new BehaviorSubject([somePolicy]);
      policyService.getAll$.mockReturnValueOnce(somePolicySubject.asObservable());
      const emissions: any = [];
      const sub = generator
        .policy$(SomeConfiguration, { userId$ })
        .subscribe((policy) => emissions.push(policy));

      // swap the active policy for an inactive policy
      somePolicySubject.next([]);
      await awaitAsync();
      sub.unsubscribe();
      const [someResult, anotherResult] = emissions;

      expect(someResult.policy).toEqual({ fooPolicy: true });
      expect(someResult.policyInEffect).toBeTruthy();
      expect(anotherResult.policy).toEqual(SomeConfiguration.policy.disabledValue);
      expect(anotherResult.policyInEffect).toBeFalsy();
    });

    it("follows user emissions", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      const somePolicy$ = new BehaviorSubject([somePolicy]).asObservable();
      const anotherPolicy$ = new BehaviorSubject([]).asObservable();
      policyService.getAll$.mockReturnValueOnce(somePolicy$).mockReturnValueOnce(anotherPolicy$);
      const emissions: any = [];
      const sub = generator
        .policy$(SomeConfiguration, { userId$ })
        .subscribe((policy) => emissions.push(policy));

      // swapping the user invokes the return for `anotherPolicy$`
      userId.next(AnotherUser);
      await awaitAsync();
      sub.unsubscribe();
      const [someResult, anotherResult] = emissions;

      expect(someResult.policy).toEqual({ fooPolicy: true });
      expect(someResult.policyInEffect).toBeTruthy();
      expect(anotherResult.policy).toEqual(SomeConfiguration.policy.disabledValue);
      expect(anotherResult.policyInEffect).toBeFalsy();
    });

    it("errors when the user errors", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();
      const expectedError = { some: "error" };

      let actualError: any = null;
      generator.policy$(SomeConfiguration, { userId$ }).subscribe({
        error: (e: unknown) => {
          actualError = e;
        },
      });
      userId.error(expectedError);
      await awaitAsync();

      expect(actualError).toEqual(expectedError);
    });

    it("completes when the user completes", async () => {
      const generator = new CredentialGeneratorService(randomizer, stateProvider, policyService);
      const userId = new BehaviorSubject(SomeUser);
      const userId$ = userId.asObservable();

      let completed = false;
      generator.policy$(SomeConfiguration, { userId$ }).subscribe({
        complete: () => {
          completed = true;
        },
      });
      userId.complete();
      await awaitAsync();

      expect(completed).toBeTruthy();
    });
  });
});
