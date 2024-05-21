import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class PasswordGeneratorPolicy extends BasePolicy {
  name = "passwordGenerator";
  description = "passwordGeneratorPolicyDesc";
  type = PolicyType.PasswordGenerator;
  component = PasswordGeneratorPolicyComponent;
}

@Component({
  selector: "policy-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    defaultType: [null],
    minLength: [null, [Validators.min(5), Validators.max(128)]],
    useUpper: [null],
    useLower: [null],
    useNumbers: [null],
    useSpecial: [null],
    minNumbers: [null, [Validators.min(0), Validators.max(9)]],
    minSpecial: [null, [Validators.min(0), Validators.max(9)]],
    minNumberWords: [null, [Validators.min(3), Validators.max(20)]],
    capitalize: [null],
    includeNumber: [null],
  });

  defaultTypes: { name: string; value: string }[];

  constructor(
    private formBuilder: UntypedFormBuilder,
    i18nService: I18nService,
  ) {
    super();

    this.defaultTypes = [
      { name: i18nService.t("userPreference"), value: null },
      { name: i18nService.t("password"), value: "password" },
      { name: i18nService.t("passphrase"), value: "passphrase" },
    ];
  }
}
