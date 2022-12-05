import { Component, HostBinding, Input } from "@angular/core";

import { RadioGroupComponent } from "./radio-group.component";

let nextId = 0;

@Component({
  selector: "bit-radio-button",
  templateUrl: "radio-button.component.html",
})
export class RadioButtonComponent {
  @HostBinding("attr.id") @Input() id = `bit-radio-button-${nextId++}`;
  @Input() value: unknown;

  constructor(private groupComponent: RadioGroupComponent) {}

  get inputId() {
    return `${this.id}-input`;
  }

  get name() {
    return this.groupComponent.name;
  }

  get selected() {
    return this.groupComponent.selected === this.value;
  }

  get disabled() {
    return this.groupComponent.disabled;
  }

  protected onInputChange() {
    this.groupComponent.onInputChange(this.value);
  }

  protected onBlur() {
    this.groupComponent.onBlur();
  }
}
