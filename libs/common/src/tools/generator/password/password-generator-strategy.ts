import { BehaviorSubject, map, pipe } from "rxjs";

import { GeneratorStrategy } from "..";
import { PolicyType } from "../../../admin-console/enums";
import { StateProvider } from "../../../platform/state";
import { UserId } from "../../../types/guid";
import { PasswordGenerationServiceAbstraction } from "../abstractions/password-generation.service.abstraction";
import { PASSWORD_SETTINGS } from "../key-definitions";
import { distinctIfShallowMatch, reduceCollection } from "../rx-operators";

import {
  DefaultPasswordGenerationOptions,
  PasswordGenerationOptions,
} from "./password-generation-options";
import { PasswordGeneratorOptionsEvaluator } from "./password-generator-options-evaluator";
import {
  DisabledPasswordGeneratorPolicy,
  PasswordGeneratorPolicy,
  leastPrivilege,
} from "./password-generator-policy";

/** {@link GeneratorStrategy} */
export class PasswordGeneratorStrategy
  implements GeneratorStrategy<PasswordGenerationOptions, PasswordGeneratorPolicy>
{
  /** instantiates the password generator strategy.
   *  @param legacy generates the password
   */
  constructor(
    private legacy: PasswordGenerationServiceAbstraction,
    private stateProvider: StateProvider,
  ) {}

  /** {@link GeneratorStrategy.durableState} */
  durableState(id: UserId) {
    return this.stateProvider.getUser(id, PASSWORD_SETTINGS);
  }

  /** Gets the default options. */
  defaults$(_: UserId) {
    return new BehaviorSubject({ ...DefaultPasswordGenerationOptions }).asObservable();
  }

  /** {@link GeneratorStrategy.policy} */
  get policy() {
    return PolicyType.PasswordGenerator;
  }

  /** {@link GeneratorStrategy.toEvaluator} */
  toEvaluator() {
    return pipe(
      reduceCollection(leastPrivilege, DisabledPasswordGeneratorPolicy),
      distinctIfShallowMatch(),
      map((policy) => new PasswordGeneratorOptionsEvaluator(policy)),
    );
  }

  /** {@link GeneratorStrategy.generate} */
  generate(options: PasswordGenerationOptions): Promise<string> {
    return this.legacy.generatePassword({ ...options, type: "password" });
  }
}
