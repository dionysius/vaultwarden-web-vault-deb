import {
  AfterContentInit,
  Directive,
  EventEmitter,
  Host,
  HostListener,
  Input,
  OnChanges,
  Output,
} from "@angular/core";

import { ButtonComponent } from "../button";

import { BitFormFieldComponent } from "./form-field.component";

@Directive({
  selector: "[bitPasswordInputToggle]",
})
export class BitPasswordInputToggleDirective implements AfterContentInit, OnChanges {
  @Input() toggled = false;
  @Output() toggledChange = new EventEmitter<boolean>();

  @HostListener("click") onClick() {
    this.toggled = !this.toggled;
    this.toggledChange.emit(this.toggled);

    this.update();

    this.formField.input?.focus();
  }

  constructor(@Host() private button: ButtonComponent, private formField: BitFormFieldComponent) {}

  get icon() {
    return this.toggled ? "bwi-eye-slash" : "bwi-eye";
  }

  ngOnChanges(): void {
    this.update();
  }

  ngAfterContentInit(): void {
    this.toggled = this.formField.input.type !== "password";
    this.button.icon = this.icon;
  }

  private update() {
    this.button.icon = this.icon;
    if (this.formField.input?.type != null) {
      this.formField.input.type = this.toggled ? "text" : "password";
      this.formField.input.spellcheck = this.toggled ? false : undefined;
    }
  }
}
