import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { EFFLongWordList } from "@bitwarden/common/platform/misc/wordlist";
import { StateProvider } from "@bitwarden/common/platform/state";

import { GeneratorStrategy, Randomizer } from "../abstractions";
import { DefaultEffUsernameOptions } from "../data";
import { newDefaultEvaluator } from "../rx";
import { EffUsernameGenerationOptions, NoPolicy } from "../types";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import { EFF_USERNAME_SETTINGS } from "./storage";

/** Strategy for creating usernames from the EFF wordlist */
export class EffUsernameGeneratorStrategy
  implements GeneratorStrategy<EffUsernameGenerationOptions, NoPolicy>
{
  /** Instantiates the generation strategy
   *  @param usernameService generates a username from EFF word list
   */
  constructor(
    private random: Randomizer,
    private stateProvider: StateProvider,
    private defaultOptions: EffUsernameGenerationOptions = DefaultEffUsernameOptions,
  ) {}

  // configuration
  durableState = sharedStateByUserId(EFF_USERNAME_SETTINGS, this.stateProvider);
  defaults$ = clone$PerUserId(this.defaultOptions);
  toEvaluator = newDefaultEvaluator<EffUsernameGenerationOptions>();
  readonly policy = PolicyType.PasswordGenerator;

  // algorithm
  async generate(options: EffUsernameGenerationOptions) {
    const word = await this.random.pickWord(EFFLongWordList, {
      titleCase: options.wordCapitalize ?? DefaultEffUsernameOptions.wordCapitalize,
      number: options.wordIncludeNumber ?? DefaultEffUsernameOptions.wordIncludeNumber,
    });
    return word;
  }
}
