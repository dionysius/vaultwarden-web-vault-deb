import { Directive, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { combineLatestWith, Subject, takeUntil } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Policy } from "@bitwarden/common/models/domain/policy";

@Directive()
export class VaultTimeoutInputComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy
{
  get showCustom() {
    return this.form.get("vaultTimeout").value === VaultTimeoutInputComponent.CUSTOM_VALUE;
  }

  get exceedsMinimumTimout(): boolean {
    return (
      !this.showCustom || this.customTimeInMinutes() > VaultTimeoutInputComponent.MIN_CUSTOM_MINUTES
    );
  }

  static CUSTOM_VALUE = -100;
  static MIN_CUSTOM_MINUTES = 0;

  form = this.formBuilder.group({
    vaultTimeout: [null],
    custom: this.formBuilder.group({
      hours: [null],
      minutes: [null],
    }),
  });

  @Input() vaultTimeouts: { name: string; value: number }[];
  vaultTimeoutPolicy: Policy;
  vaultTimeoutPolicyHours: number;
  vaultTimeoutPolicyMinutes: number;

  private onChange: (vaultTimeout: number) => void;
  private validatorChange: () => void;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private policyService: PolicyService,
    private i18nService: I18nService
  ) {}

  async ngOnInit() {
    this.policyService
      .policyAppliesToActiveUser$(PolicyType.MaximumVaultTimeout)
      .pipe(combineLatestWith(this.policyService.policies$), takeUntil(this.destroy$))
      .subscribe(([policyAppliesToActiveUser, policies]) => {
        if (policyAppliesToActiveUser) {
          const vaultTimeoutPolicy = policies.find(
            (policy) => policy.type === PolicyType.MaximumVaultTimeout && policy.enabled
          );

          this.vaultTimeoutPolicy = vaultTimeoutPolicy;
          this.applyVaultTimeoutPolicy();
        }
      });

    // eslint-disable-next-line rxjs/no-async-subscribe
    this.form.valueChanges.subscribe(async (value) => {
      this.onChange(this.getVaultTimeout(value));
    });

    // Assign the previous value to the custom fields
    this.form.get("vaultTimeout").valueChanges.subscribe((value) => {
      if (value !== VaultTimeoutInputComponent.CUSTOM_VALUE) {
        return;
      }

      const current = Math.max(this.form.value.vaultTimeout, 0);
      this.form.patchValue({
        custom: {
          hours: Math.floor(current / 60),
          minutes: current % 60,
        },
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    this.vaultTimeouts.push({
      name: this.i18nService.t("custom"),
      value: VaultTimeoutInputComponent.CUSTOM_VALUE,
    });
  }

  getVaultTimeout(value: any) {
    if (value.vaultTimeout !== VaultTimeoutInputComponent.CUSTOM_VALUE) {
      return value.vaultTimeout;
    }

    return value.custom.hours * 60 + value.custom.minutes;
  }

  writeValue(value: number): void {
    if (value == null) {
      return;
    }

    if (this.vaultTimeouts.every((p) => p.value !== value)) {
      this.form.setValue({
        vaultTimeout: VaultTimeoutInputComponent.CUSTOM_VALUE,
        custom: {
          hours: Math.floor(value / 60),
          minutes: value % 60,
        },
      });
      return;
    }

    this.form.patchValue({
      vaultTimeout: value,
    });
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    // Empty
  }

  setDisabledState?(isDisabled: boolean): void {
    // Empty
  }

  validate(control: AbstractControl): ValidationErrors {
    if (this.vaultTimeoutPolicy && this.vaultTimeoutPolicy?.data?.minutes < control.value) {
      return { policyError: true };
    }

    if (!this.exceedsMinimumTimout) {
      return { minTimeoutError: true };
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorChange = fn;
  }

  private customTimeInMinutes() {
    return this.form.value.custom.hours * 60 + this.form.value.custom.minutes;
  }

  private applyVaultTimeoutPolicy() {
    this.vaultTimeoutPolicyHours = Math.floor(this.vaultTimeoutPolicy.data.minutes / 60);
    this.vaultTimeoutPolicyMinutes = this.vaultTimeoutPolicy.data.minutes % 60;

    this.vaultTimeouts = this.vaultTimeouts.filter(
      (t) =>
        t.value <= this.vaultTimeoutPolicy.data.minutes &&
        (t.value > 0 || t.value === VaultTimeoutInputComponent.CUSTOM_VALUE) &&
        t.value != null
    );
    this.validatorChange();
  }
}
