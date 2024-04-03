import { BehaviorSubject, map, pipe } from "rxjs";

import { PolicyType } from "../../../admin-console/enums";
import { StateProvider } from "../../../platform/state";
import { UserId } from "../../../types/guid";
import { GeneratorStrategy } from "../abstractions";
import { UsernameGenerationServiceAbstraction } from "../abstractions/username-generation.service.abstraction";
import { DefaultPolicyEvaluator } from "../default-policy-evaluator";
import { SUBADDRESS_SETTINGS } from "../key-definitions";
import { NoPolicy } from "../no-policy";

import {
  DefaultSubaddressOptions,
  SubaddressGenerationOptions,
} from "./subaddress-generator-options";

const ONE_MINUTE = 60 * 1000;

/** Strategy for creating an email subaddress
 *  @remarks The subaddress is the part following the `+`.
 *  For example, if the email address is `jd+xyz@domain.io`,
 *  the subaddress is `xyz`.
 */
export class SubaddressGeneratorStrategy
  implements GeneratorStrategy<SubaddressGenerationOptions, NoPolicy>
{
  /** Instantiates the generation strategy
   *  @param usernameService generates an email subaddress from an email address
   */
  constructor(
    private usernameService: UsernameGenerationServiceAbstraction,
    private stateProvider: StateProvider,
  ) {}

  /** {@link GeneratorStrategy.durableState} */
  durableState(id: UserId) {
    return this.stateProvider.getUser(id, SUBADDRESS_SETTINGS);
  }

  /** {@link GeneratorStrategy.defaults$} */
  defaults$(userId: UserId) {
    return new BehaviorSubject({ ...DefaultSubaddressOptions }).asObservable();
  }

  /** {@link GeneratorStrategy.policy} */
  get policy() {
    // Uses password generator since there aren't policies
    // specific to usernames.
    return PolicyType.PasswordGenerator;
  }

  /** {@link GeneratorStrategy.cache_ms} */
  get cache_ms() {
    return ONE_MINUTE;
  }

  /** {@link GeneratorStrategy.toEvaluator} */
  toEvaluator() {
    return pipe(map((_) => new DefaultPolicyEvaluator<SubaddressGenerationOptions>()));
  }

  /** {@link GeneratorStrategy.generate} */
  generate(options: SubaddressGenerationOptions) {
    return this.usernameService.generateSubaddress(options);
  }
}
