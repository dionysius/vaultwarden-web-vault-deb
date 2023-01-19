import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

let nextId = 0;

@Component({
  selector: "bit-toggle-group",
  templateUrl: "./toggle-group.component.html",
  preserveWhitespaces: false,
})
export class ToggleGroupComponent<TValue = unknown> {
  private id = nextId++;
  name = `bit-toggle-group-${this.id}`;

  @Input() selected?: TValue;
  @Output() selectedChange = new EventEmitter<TValue>();

  @HostBinding("attr.role") role = "radiogroup";
  @HostBinding("class") classList = ["tw-flex"];

  onInputInteraction(value: TValue) {
    this.selected = value;
    this.selectedChange.emit(value);
  }
}
