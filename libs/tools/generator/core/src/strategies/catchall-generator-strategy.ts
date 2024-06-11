import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { StateProvider } from "@bitwarden/common/platform/state";

import { GeneratorStrategy, Randomizer } from "../abstractions";
import { DefaultCatchallOptions } from "../data";
import { newDefaultEvaluator } from "../rx";
import { NoPolicy, CatchallGenerationOptions } from "../types";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import { CATCHALL_SETTINGS } from "./storage";

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
