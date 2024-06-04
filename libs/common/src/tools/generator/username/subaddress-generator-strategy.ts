import { PolicyType } from "../../../admin-console/enums";
import { StateProvider } from "../../../platform/state";
import { GeneratorStrategy } from "../abstractions";
import { Randomizer } from "../abstractions/randomizer";
import { SUBADDRESS_SETTINGS } from "../key-definitions";
import { NoPolicy } from "../no-policy";
import { newDefaultEvaluator } from "../rx-operators";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import {
  DefaultSubaddressOptions,
  SubaddressGenerationOptions,
} from "./subaddress-generator-options";

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
    private random: Randomizer,
    private stateProvider: StateProvider,
    private defaultOptions: SubaddressGenerationOptions = DefaultSubaddressOptions,
  ) {}

  // configuration
  durableState = sharedStateByUserId(SUBADDRESS_SETTINGS, this.stateProvider);
  defaults$ = clone$PerUserId(this.defaultOptions);
  toEvaluator = newDefaultEvaluator<SubaddressGenerationOptions>();
  readonly policy = PolicyType.PasswordGenerator;

  // algorithm
  async generate(options: SubaddressGenerationOptions) {
    const o = Object.assign({}, DefaultSubaddressOptions, options);

    const subaddressEmail = o.subaddressEmail;
    if (subaddressEmail == null || subaddressEmail.length < 3) {
      return o.subaddressEmail;
    }
    const atIndex = subaddressEmail.indexOf("@");
    if (atIndex < 1 || atIndex >= subaddressEmail.length - 1) {
      return subaddressEmail;
    }
    if (o.subaddressType == null) {
      o.subaddressType = "random";
    }

    const emailBeginning = subaddressEmail.substr(0, atIndex);
    const emailEnding = subaddressEmail.substr(atIndex + 1, subaddressEmail.length);

    let subaddressString = "";
    if (o.subaddressType === "random") {
      subaddressString = await this.random.chars(8);
    } else if (o.subaddressType === "website-name") {
      subaddressString = o.website;
    }
    return emailBeginning + "+" + subaddressString + "@" + emailEnding;
  }
}
