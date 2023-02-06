import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, Input } from "@angular/core";

import { Option } from "./option";

@Component({
  selector: "bit-option",
  template: `<ng-template><ng-content></ng-content></ng-template>`,
})
export class OptionComponent<T = unknown> implements Option<T> {
  @Input()
  icon?: string;

  @Input()
  value?: T = undefined;

  @Input()
  label?: string;

  private _disabled = false;
  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean | "") {
    this._disabled = coerceBooleanProperty(value);
  }
}
