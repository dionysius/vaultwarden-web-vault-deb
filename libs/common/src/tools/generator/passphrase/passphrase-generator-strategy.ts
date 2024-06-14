import { GeneratorStrategy } from "..";
import { PolicyType } from "../../../admin-console/enums";
import { EFFLongWordList } from "../../../platform/misc/wordlist";
import { StateProvider } from "../../../platform/state";
import { Randomizer } from "../abstractions/randomizer";
import { PASSPHRASE_SETTINGS } from "../key-definitions";
import { Policies } from "../policies";
import { mapPolicyToEvaluator } from "../rx-operators";
import { clone$PerUserId, sharedStateByUserId } from "../util";

import {
  PassphraseGenerationOptions,
  DefaultPassphraseGenerationOptions,
} from "./passphrase-generation-options";
import { PassphraseGeneratorPolicy } from "./passphrase-generator-policy";

/** Generates passphrases composed of random words */
export class PassphraseGeneratorStrategy
  implements GeneratorStrategy<PassphraseGenerationOptions, PassphraseGeneratorPolicy>
{
  /** instantiates the password generator strategy.
   *  @param legacy generates the passphrase
   *  @param stateProvider provides durable state
   */
  constructor(
    private randomizer: Randomizer,
    private stateProvider: StateProvider,
  ) {}

  // configuration
  durableState = sharedStateByUserId(PASSPHRASE_SETTINGS, this.stateProvider);
  defaults$ = clone$PerUserId(DefaultPassphraseGenerationOptions);
  readonly policy = PolicyType.PasswordGenerator;
  toEvaluator() {
    return mapPolicyToEvaluator(Policies.Passphrase);
  }

  // algorithm
  async generate(options: PassphraseGenerationOptions): Promise<string> {
    const o = { ...DefaultPassphraseGenerationOptions, ...options };
    if (o.numWords == null || o.numWords <= 2) {
      o.numWords = DefaultPassphraseGenerationOptions.numWords;
    }
    if (o.capitalize == null) {
      o.capitalize = false;
    }
    if (o.includeNumber == null) {
      o.includeNumber = false;
    }

    // select which word gets the number, if any
    let luckyNumber = -1;
    if (o.includeNumber) {
      luckyNumber = await this.randomizer.uniform(0, o.numWords - 1);
    }

    // generate the passphrase
    const wordList = new Array(o.numWords);
    for (let i = 0; i < o.numWords; i++) {
      const word = await this.randomizer.pickWord(EFFLongWordList, {
        titleCase: o.capitalize,
        number: i === luckyNumber,
      });

      wordList[i] = word;
    }

    return wordList.join(o.wordSeparator);
  }
}
