import { Component, HostBinding, Input } from "@angular/core";

import { ToggleGroupComponent } from "./toggle-group.component";

let nextId = 0;

@Component({
  selector: "bit-toggle",
  templateUrl: "./toggle.component.html",
  preserveWhitespaces: false,
})
export class ToggleComponent<TValue> {
  id = nextId++;

  @Input() value?: TValue;

  constructor(private groupComponent: ToggleGroupComponent<TValue>) {}

  @HostBinding("tabIndex") tabIndex = "-1";
  @HostBinding("class") classList = ["tw-group/toggle"];

  get name() {
    return this.groupComponent.name;
  }

  get selected() {
    return this.groupComponent.selected === this.value;
  }

  get inputClasses() {
    return ["tw-peer/toggle-input", "tw-appearance-none", "tw-outline-none"];
  }

  get labelClasses() {
    return [
      "tw-w-full",
      "tw-justify-center",
      "!tw-font-semibold",
      "tw-inline-block",
      "tw-transition",
      "tw-text-center",
      "tw-border-text-muted",
      "!tw-text-muted",
      "tw-border-solid",
      "tw-border-y",
      "tw-border-r",
      "tw-border-l-0",
      "tw-cursor-pointer",
      "group-first-of-type/toggle:tw-border-l",
      "group-first-of-type/toggle:tw-rounded-l",
      "group-last-of-type/toggle:tw-rounded-r",

      "peer-focus/toggle-input:tw-outline-none",
      "peer-focus/toggle-input:tw-ring",
      "peer-focus/toggle-input:tw-ring-offset-2",
      "peer-focus/toggle-input:tw-ring-primary-600",
      "peer-focus/toggle-input:tw-z-10",
      "peer-focus/toggle-input:tw-bg-primary-600",
      "peer-focus/toggle-input:tw-border-primary-600",
      "peer-focus/toggle-input:!tw-text-contrast",

      "hover:tw-no-underline",
      "hover:tw-bg-text-muted",
      "hover:tw-border-text-muted",
      "hover:!tw-text-contrast",

      "peer-checked/toggle-input:tw-bg-primary-600",
      "peer-checked/toggle-input:tw-border-primary-600",
      "peer-checked/toggle-input:!tw-text-contrast",
      "tw-py-1.5",
      "tw-px-3",

      // Fix for bootstrap styles that add bottom margin
      "!tw-mb-0",

      // Fix for badge being slightly off center vertically
      "[&>[bitBadge]]:tw-mt-px",
    ];
  }

  onInputInteraction() {
    this.groupComponent.onInputInteraction(this.value);
  }
}
