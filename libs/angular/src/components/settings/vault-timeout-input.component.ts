import { Directive, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { filter, Subject, takeUntil } from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

@Directive()
export class VaultTimeoutInputComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy, OnChanges
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

  @Input() vaultTimeoutOptions: { name: string; value: number }[];
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
      .get$(PolicyType.MaximumVaultTimeout)
      .pipe(
        filter((policy) => policy != null),
        takeUntil(this.destroy$)
      )
      .subscribe((policy) => {
        this.vaultTimeoutPolicy = policy;
        this.applyVaultTimeoutPolicy();
      });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (this.onChange) {
        this.onChange(this.getVaultTimeout(value));
      }
    });

    // Assign the previous value to the custom fields
    this.form.controls.vaultTimeout.valueChanges
      .pipe(
        filter((value) => value !== VaultTimeoutInputComponent.CUSTOM_VALUE),
        takeUntil(this.destroy$)
      )
      .subscribe((_) => {
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
    if (
      !this.vaultTimeoutOptions.find((p) => p.value === VaultTimeoutInputComponent.CUSTOM_VALUE)
    ) {
      this.vaultTimeoutOptions.push({
        name: this.i18nService.t("custom"),
        value: VaultTimeoutInputComponent.CUSTOM_VALUE,
      });
    }
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

    if (this.vaultTimeoutOptions.every((p) => p.value !== value)) {
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

    this.vaultTimeoutOptions = this.vaultTimeoutOptions.filter(
      (t) =>
        t.value <= this.vaultTimeoutPolicy.data.minutes &&
        (t.value > 0 || t.value === VaultTimeoutInputComponent.CUSTOM_VALUE) &&
        t.value != null
    );
    this.validatorChange();
  }
}
