import { concatMap, zip, map, firstValueFrom } from "rxjs";

import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { PasswordGeneratorPolicyOptions } from "../../admin-console/models/domain/password-generator-policy-options";
import { AccountService } from "../../auth/abstractions/account.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { StateProvider } from "../../platform/state";

import { GeneratorService, GeneratorNavigationService } from "./abstractions";
import { PasswordGenerationServiceAbstraction } from "./abstractions/password-generation.service.abstraction";
import { DefaultGeneratorService } from "./default-generator.service";
import { DefaultGeneratorNavigationService } from "./navigation/default-generator-navigation.service";
import {
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy,
  PassphraseGeneratorStrategy,
} from "./passphrase";
import {
  PasswordGenerationOptions,
  PasswordGenerationService,
  PasswordGeneratorOptions,
  PasswordGeneratorPolicy,
  PasswordGeneratorStrategy,
} from "./password";

export function legacyPasswordGenerationServiceFactory(
  cryptoService: CryptoService,
  policyService: PolicyService,
  accountService: AccountService,
  stateProvider: StateProvider,
): PasswordGenerationServiceAbstraction {
  // FIXME: Once the password generation service is replaced with this service
  // in the clients, factor out the deprecated service in its entirety.
  const deprecatedService = new PasswordGenerationService(cryptoService, null, null);

  const passwords = new DefaultGeneratorService(
    new PasswordGeneratorStrategy(deprecatedService, stateProvider),
    policyService,
  );

  const passphrases = new DefaultGeneratorService(
    new PassphraseGeneratorStrategy(deprecatedService, stateProvider),
    policyService,
  );

  const navigation = new DefaultGeneratorNavigationService(stateProvider, policyService);

  return new LegacyPasswordGenerationService(accountService, navigation, passwords, passphrases);
}

/** Adapts the generator 2.0 design to 1.0 angular services. */
export class LegacyPasswordGenerationService implements PasswordGenerationServiceAbstraction {
  constructor(
    private readonly accountService: AccountService,
    private readonly navigation: GeneratorNavigationService,
    private readonly passwords: GeneratorService<
      PasswordGenerationOptions,
      PasswordGeneratorPolicy
    >,
    private readonly passphrases: GeneratorService<
      PassphraseGenerationOptions,
      PassphraseGeneratorPolicy
    >,
  ) {}

  generatePassword(options: PasswordGeneratorOptions) {
    if (options.type === "password") {
      return this.passwords.generate(options);
    } else {
      return this.passphrases.generate(options);
    }
  }

  generatePassphrase(options: PasswordGeneratorOptions) {
    return this.passphrases.generate(options);
  }

  async getOptions() {
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((activeUser) =>
        zip(
          this.passwords.options$(activeUser.id),
          this.passwords.defaults$(activeUser.id),
          this.passwords.evaluator$(activeUser.id),
          this.passphrases.options$(activeUser.id),
          this.passphrases.defaults$(activeUser.id),
          this.passphrases.evaluator$(activeUser.id),
          this.navigation.options$(activeUser.id),
          this.navigation.defaults$(activeUser.id),
          this.navigation.evaluator$(activeUser.id),
        ),
      ),
      map(
        ([
          passwordOptions,
          passwordDefaults,
          passwordEvaluator,
          passphraseOptions,
          passphraseDefaults,
          passphraseEvaluator,
          generatorOptions,
          generatorDefaults,
          generatorEvaluator,
        ]) => {
          const options: PasswordGeneratorOptions = Object.assign(
            {},
            passwordOptions ?? passwordDefaults,
            passphraseOptions ?? passphraseDefaults,
            generatorOptions ?? generatorDefaults,
          );

          const policy = Object.assign(
            new PasswordGeneratorPolicyOptions(),
            passwordEvaluator.policy,
            passphraseEvaluator.policy,
            generatorEvaluator.policy,
          );

          return [options, policy] as [PasswordGenerationOptions, PasswordGeneratorPolicyOptions];
        },
      ),
    );

    const options = await firstValueFrom(options$);
    return options;
  }

  async enforcePasswordGeneratorPoliciesOnOptions(options: PasswordGeneratorOptions) {
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((activeUser) =>
        zip(
          this.passwords.evaluator$(activeUser.id),
          this.passphrases.evaluator$(activeUser.id),
          this.navigation.evaluator$(activeUser.id),
        ),
      ),
      map(([passwordEvaluator, passphraseEvaluator, navigationEvaluator]) => {
        const policy = Object.assign(
          new PasswordGeneratorPolicyOptions(),
          passwordEvaluator.policy,
          passphraseEvaluator.policy,
          navigationEvaluator.policy,
        );

        const navigationApplied = navigationEvaluator.applyPolicy(options);
        const navigationSanitized = {
          ...options,
          ...navigationEvaluator.sanitize(navigationApplied),
        };
        if (options.type === "password") {
          const applied = passwordEvaluator.applyPolicy(navigationSanitized);
          const sanitized = passwordEvaluator.sanitize(applied);
          return [sanitized, policy];
        } else {
          const applied = passphraseEvaluator.applyPolicy(navigationSanitized);
          const sanitized = passphraseEvaluator.sanitize(applied);
          return [sanitized, policy];
        }
      }),
    );

    const [sanitized, policy] = await firstValueFrom(options$);
    return [
      // callers assume this function updates the options parameter
      Object.assign(options, sanitized),
      policy,
    ] as [PasswordGenerationOptions, PasswordGeneratorPolicyOptions];
  }

  async saveOptions(options: PasswordGeneratorOptions) {
    const activeAccount = await firstValueFrom(this.accountService.activeAccount$);

    await this.navigation.saveOptions(activeAccount.id, options);
    if (options.type === "password") {
      await this.passwords.saveOptions(activeAccount.id, options);
    } else {
      await this.passphrases.saveOptions(activeAccount.id, options);
    }
  }

  getHistory: () => Promise<any[]>;
  addHistory: (password: string) => Promise<void>;
  clear: (userId?: string) => Promise<void>;
}
