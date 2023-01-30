import { Component, Input } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { I18nMockService } from "../utils/i18n-mock.service";

import { RadioButtonModule } from "./radio-button.module";

const template = `
  <form [formGroup]="formObj">
    <bit-radio-group formControlName="radio" aria-label="Example radio group">
      <bit-label *ngIf="label">Group of radio buttons</bit-label>
      <bit-radio-button *ngFor="let option of TestValue | keyvalue" [ngClass]="{ 'tw-block': blockLayout }"
        [value]="option.value" id="radio-{{option.key}}" [disabled]="optionDisabled?.includes(option.value)">
        <bit-label>{{ option.key }}</bit-label>
        <bit-hint *ngIf="blockLayout">This is a hint for the {{option.key}} option</bit-hint>
      </bit-radio-button>
    </bit-radio-group>
  </form>`;

const TestValue = {
  First: 0,
  Second: 1,
  Third: 2,
};

const reverseObject = (obj: Record<any, any>) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));

@Component({
  selector: "app-example",
  template: template,
})
class ExampleComponent {
  protected TestValue = TestValue;

  protected formObj = this.formBuilder.group({
    radio: TestValue.First,
  });

  @Input() layout: "block" | "inline" = "inline";

  @Input() label: boolean;

  @Input() set selected(value: number) {
    this.formObj.patchValue({ radio: value });
  }

  @Input() set groupDisabled(disable: boolean) {
    if (disable) {
      this.formObj.disable();
    } else {
      this.formObj.enable();
    }
  }

  @Input() optionDisabled: number[] = [];

  get blockLayout() {
    return this.layout === "block";
  }

  constructor(private formBuilder: FormBuilder) {}
}

export default {
  title: "Component Library/Form/Radio Button",
  component: ExampleComponent,
  decorators: [
    moduleMetadata({
      declarations: [ExampleComponent],
      imports: [FormsModule, ReactiveFormsModule, RadioButtonModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              required: "required",
              inputRequired: "Input is required.",
              inputEmail: "Input is not an email-address.",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=3930%3A16850&t=xXPx6GJYsJfuMQPE-4",
    },
  },
  args: {
    selected: TestValue.First,
    groupDisabled: false,
    optionDisabled: null,
    label: true,
    layout: "inline",
  },
  argTypes: {
    selected: {
      options: Object.values(TestValue),
      control: {
        type: "inline-radio",
        labels: reverseObject(TestValue),
      },
    },
    optionDisabled: {
      options: Object.values(TestValue),
      control: {
        type: "check",
        labels: reverseObject(TestValue),
      },
    },
    layout: {
      options: ["inline", "block"],
      control: {
        type: "inline-radio",
        labels: ["inline", "block"],
      },
    },
  },
} as Meta;

const storyTemplate = `<app-example [selected]="selected" [groupDisabled]="groupDisabled" [optionDisabled]="optionDisabled" [label]="label" [layout]="layout"></app-example>`;

const InlineTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: storyTemplate,
});

export const Inline = InlineTemplate.bind({});
Inline.args = {
  layout: "inline",
};

const BlockTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: storyTemplate,
});

export const Block = BlockTemplate.bind({});
Block.args = {
  layout: "block",
};
