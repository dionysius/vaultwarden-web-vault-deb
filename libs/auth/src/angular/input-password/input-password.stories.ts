import { importProvidersFrom } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { action } from "@storybook/addon-actions";
import { Meta, StoryObj, applicationConfig } from "@storybook/angular";
import { of } from "rxjs";
import { ZXCVBNResult } from "zxcvbn";

import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/admin-console/models/domain/master-password-policy-options";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { DialogService, ToastService } from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../../../apps/web/src/app/core/tests";

import { InputPasswordComponent } from "./input-password.component";

const mockMasterPasswordPolicyOptions = {
  minComplexity: 4,
  minLength: 14,
  requireUpper: true,
  requireLower: true,
  requireNumbers: true,
  requireSpecial: true,
} as MasterPasswordPolicyOptions;

export default {
  title: "Auth/Input Password",
  component: InputPasswordComponent,
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(PreloadedEnglishI18nModule),
        importProvidersFrom(BrowserAnimationsModule),
        {
          provide: AuditService,
          useValue: {
            passwordLeaked: () => Promise.resolve(1),
          } as Partial<AuditService>,
        },
        {
          provide: CryptoService,
          useValue: {
            makeMasterKey: () => Promise.resolve("example-master-key"),
            hashMasterKey: () => Promise.resolve("example-master-key-hash"),
          },
        },
        {
          provide: DialogService,
          useValue: {
            openSimpleDialog: () => Promise.resolve(true),
          } as Partial<DialogService>,
        },
        {
          provide: PolicyApiServiceAbstraction,
          useValue: {
            getMasterPasswordPolicyOptsForOrgUser: () => mockMasterPasswordPolicyOptions,
          } as Partial<PolicyService>,
        },
        {
          provide: PolicyService,
          useValue: {
            masterPasswordPolicyOptions$: () => of(mockMasterPasswordPolicyOptions),
            evaluateMasterPassword: (score) => {
              if (score < 4) {
                return false;
              }
              return true;
            },
          } as Partial<PolicyService>,
        },
        {
          provide: PasswordStrengthServiceAbstraction,
          useValue: {
            getPasswordStrength: (password) => {
              let score = 0;

              if (password.length === 0) {
                score = null;
              } else if (password.length <= 4) {
                score = 1;
              } else if (password.length <= 8) {
                score = 2;
              } else if (password.length <= 12) {
                score = 3;
              } else {
                score = 4;
              }

              return { score } as ZXCVBNResult;
            },
          } as Partial<PasswordStrengthServiceAbstraction>,
        },
        {
          provide: ToastService,
          useValue: {
            showToast: action("ToastService.showToast"),
          } as Partial<ToastService>,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<InputPasswordComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-input-password></auth-input-password>
    `,
  }),
};
