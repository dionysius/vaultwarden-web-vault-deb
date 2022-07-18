import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";

let nextId = 0;

@Component({
  selector: "bit-toggle-group",
  templateUrl: "./toggle-group.component.html",
  preserveWhitespaces: false,
})
export class ToggleGroupComponent {
  private id = nextId++;
  name = `bit-toggle-group-${this.id}`;

  @Input() selected?: unknown;
  @Output() selectedChange = new EventEmitter<unknown>();

  @HostBinding("attr.role") role = "radiogroup";
  @HostBinding("class") classList = ["tw-flex"];

  onInputInteraction(value: unknown) {
    this.selected = value;
    this.selectedChange.emit(value);
  }
}
