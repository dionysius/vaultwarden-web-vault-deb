import { GeneratorStrategy } from "..";
import { PolicyType } from "../../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "../../../admin-console/models/domain/policy";
import { PASSPHRASE_SETTINGS } from "../key-definitions";
import { PasswordGenerationServiceAbstraction } from "../password/password-generation.service.abstraction";

import { PassphraseGenerationOptions } from "./passphrase-generation-options";
import { PassphraseGeneratorOptionsEvaluator } from "./passphrase-generator-options-evaluator";
import { PassphraseGeneratorPolicy } from "./passphrase-generator-policy";

const ONE_MINUTE = 60 * 1000;

/** {@link GeneratorStrategy} */
export class PassphraseGeneratorStrategy
  implements GeneratorStrategy<PassphraseGenerationOptions, PassphraseGeneratorPolicy>
{
  /** instantiates the password generator strategy.
   *  @param legacy generates the passphrase
   */
  constructor(private legacy: PasswordGenerationServiceAbstraction) {}

  /** {@link GeneratorStrategy.disk} */
  get disk() {
    return PASSPHRASE_SETTINGS;
  }

  /** {@link GeneratorStrategy.policy} */
  get policy() {
    return PolicyType.PasswordGenerator;
  }

  get cache_ms() {
    return ONE_MINUTE;
  }

  /** {@link GeneratorStrategy.evaluator} */
  evaluator(policy: Policy): PassphraseGeneratorOptionsEvaluator {
    if (policy.type !== this.policy) {
      const details = `Expected: ${this.policy}. Received: ${policy.type}`;
      throw Error("Mismatched policy type. " + details);
    }

    return new PassphraseGeneratorOptionsEvaluator({
      minNumberWords: policy.data.minNumberWords,
      capitalize: policy.data.capitalize,
      includeNumber: policy.data.includeNumber,
    });
  }

  /** {@link GeneratorStrategy.generate} */
  generate(options: PassphraseGenerationOptions): Promise<string> {
    return this.legacy.generatePassphrase({ ...options, type: "passphrase" });
  }
}
