import { Component, HostBinding, Input, Optional, Self } from "@angular/core";
import { NgControl, Validators } from "@angular/forms";

import { BitFormControlAbstraction } from "../form-control";

@Component({
  selector: "input[type=checkbox][bitCheckbox]",
  template: "",
  providers: [{ provide: BitFormControlAbstraction, useExisting: CheckboxComponent }],
  styles: [
    `
      :host:checked:before {
        -webkit-mask-image: url('data:image/svg+xml,%3Csvg class="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="8" viewBox="0 0 10 10"%3E%3Cpath d="M0.5 6.2L2.9 8.6L9.5 1.4" fill="none" stroke="white" stroke-width="2"%3E%3C/path%3E%3C/svg%3E');
        mask-image: url('data:image/svg+xml,%3Csvg class="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="8" height="8" viewBox="0 0 10 10"%3E%3Cpath d="M0.5 6.2L2.9 8.6L9.5 1.4" fill="none" stroke="white" stroke-width="2"%3E%3C/path%3E%3C/svg%3E');
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
      }
    `,
  ],
})
export class CheckboxComponent implements BitFormControlAbstraction {
  @HostBinding("class")
  protected inputClasses = [
    "tw-appearance-none",
    "tw-outline-none",
    "tw-relative",
    "tw-transition",
    "tw-cursor-pointer",
    "tw-inline-block",
    "tw-rounded",
    "tw-border",
    "tw-border-solid",
    "tw-border-secondary-500",
    "tw-h-3.5",
    "tw-w-3.5",
    "tw-mr-1.5",
    "tw-bottom-[-1px]", // Fix checkbox looking off-center

    "before:tw-content-['']",
    "before:tw-block",
    "before:tw-absolute",
    "before:tw-inset-0",

    "hover:tw-border-2",
    "[&>label]:tw-border-2",

    "focus-visible:tw-ring-2",
    "focus-visible:tw-ring-offset-2",
    "focus-visible:tw-ring-primary-700",

    "disabled:tw-cursor-auto",
    "disabled:tw-border",
    "disabled:tw-bg-secondary-100",

    "checked:tw-bg-primary-500",
    "checked:tw-border-primary-500",

    "checked:hover:tw-bg-primary-700",
    "checked:hover:tw-border-primary-700",
    "[&>label:hover]:checked:tw-bg-primary-700",
    "[&>label:hover]:checked:tw-border-primary-700",

    "checked:before:tw-bg-text-contrast",

    "checked:disabled:tw-border-secondary-100",
    "checked:disabled:tw-bg-secondary-100",

    "checked:disabled:before:tw-bg-text-muted",
  ];

  constructor(@Optional() @Self() private ngControl?: NgControl) {}

  @HostBinding()
  @Input()
  get disabled() {
    return this._disabled ?? this.ngControl?.disabled ?? false;
  }
  set disabled(value: any) {
    this._disabled = value != null && value !== false;
  }
  private _disabled: boolean;

  @Input()
  get required() {
    return (
      this._required ?? this.ngControl?.control?.hasValidator(Validators.requiredTrue) ?? false
    );
  }
  set required(value: any) {
    this._required = value != null && value !== false;
  }
  private _required: boolean;

  get hasError() {
    return this.ngControl?.status === "INVALID" && this.ngControl?.touched;
  }

  get error(): [string, any] {
    const key = Object.keys(this.ngControl.errors)[0];
    return [key, this.ngControl.errors[key]];
  }
}
