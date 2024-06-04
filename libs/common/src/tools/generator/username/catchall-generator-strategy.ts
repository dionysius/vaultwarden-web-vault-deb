import { PolicyType } from "../../../admin-console/enums";
import { StateProvider } from "../../../platform/state";
import { GeneratorStrategy } from "../abstractions";
import { Randomizer } from "../abstractions/randomizer";
import { CATCHALL_SETTINGS } from "../key-definitions";
import { NoPolicy } from "../no-policy";
import { newDefaultEvaluator } from "../rx-operators";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import { CatchallGenerationOptions, DefaultCatchallOptions } from "./catchall-generator-options";

/** Strategy for creating usernames using a catchall email address */
export class CatchallGeneratorStrategy
  implements GeneratorStrategy<CatchallGenerationOptions, NoPolicy>
{
  /** Instantiates the generation strategy
   *  @param usernameService generates a catchall address for a domain
   */
  constructor(
    private random: Randomizer,
    private stateProvider: StateProvider,
    private defaultOptions: CatchallGenerationOptions = DefaultCatchallOptions,
  ) {}

  // configuration
  durableState = sharedStateByUserId(CATCHALL_SETTINGS, this.stateProvider);
  defaults$ = clone$PerUserId(this.defaultOptions);
  toEvaluator = newDefaultEvaluator<CatchallGenerationOptions>();
  readonly policy = PolicyType.PasswordGenerator;

  // algorithm
  async generate(options: CatchallGenerationOptions) {
    const o = Object.assign({}, DefaultCatchallOptions, options);

    if (o.catchallDomain == null || o.catchallDomain === "") {
      return null;
    }
    if (o.catchallType == null) {
      o.catchallType = "random";
    }

    let startString = "";
    if (o.catchallType === "random") {
      startString = await this.random.chars(8);
    } else if (o.catchallType === "website-name") {
      startString = o.website;
    }
    return startString + "@" + o.catchallDomain;
  }
}
