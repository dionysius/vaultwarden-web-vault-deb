import { DatePipe } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "sm-expiration-options",
  templateUrl: "./expiration-options.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ExpirationOptionsComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: ExpirationOptionsComponent,
    },
  ],
})
export class ExpirationOptionsComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy
{
  private destroy$ = new Subject<void>();

  @Input() expirationDayOptions: number[];

  @Input() set touched(val: boolean) {
    if (val) {
      this.form.markAllAsTouched();
    }
  }

  currentDate = new Date();

  protected form = new FormGroup({
    expires: new FormControl("never", [Validators.required]),
    expireDateTime: new FormControl("", [Validators.required]),
  });

  constructor(private datePipe: DatePipe) {}

  async ngOnInit() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._onChange(this.getExpiresDate());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _onChange = (_value: Date | null): void => undefined;
  registerOnChange(fn: (value: Date | null) => void): void {
    this._onChange = fn;
  }

  onTouched = (): void => undefined;
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl<any, any>): ValidationErrors {
    if (
      (this.form.value.expires == "custom" && this.form.value.expireDateTime) ||
      this.form.value.expires !== "custom"
    ) {
      return null;
    }
    return {
      required: true,
    };
  }

  writeValue(value: Date | null): void {
    if (value == null) {
      this.form.setValue({ expires: "never", expireDateTime: null });
    }
    if (value) {
      this.form.setValue({
        expires: "custom",
        expireDateTime: this.datePipe.transform(value, "YYYY-MM-ddThh:mm"),
      });
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  private getExpiresDate(): Date | null {
    if (this.form.value.expires == "never") {
      return null;
    }
    if (this.form.value.expires == "custom") {
      return new Date(this.form.value.expireDateTime);
    }
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + Number(this.form.value.expires));
    return currentDate;
  }
}
