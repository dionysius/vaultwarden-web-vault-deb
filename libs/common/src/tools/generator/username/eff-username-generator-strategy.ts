import { EFFLongWordList } from "@bitwarden/common/platform/misc/wordlist";

import { PolicyType } from "../../../admin-console/enums";
import { StateProvider } from "../../../platform/state";
import { GeneratorStrategy } from "../abstractions";
import { Randomizer } from "../abstractions/randomizer";
import { EFF_USERNAME_SETTINGS } from "../key-definitions";
import { NoPolicy } from "../no-policy";
import { newDefaultEvaluator } from "../rx-operators";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import {
  DefaultEffUsernameOptions,
  EffUsernameGenerationOptions,
} from "./eff-username-generator-options";

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
