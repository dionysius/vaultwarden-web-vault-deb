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
      <bit-radio-button [value]="TestValue.First" id="radio-first">First</bit-radio-button>
      <bit-radio-button [value]="TestValue.Second" id="radio-second">Second</bit-radio-button>
      <bit-radio-button [value]="TestValue.Third" id="radio-third">Third</bit-radio-button>
    </bit-radio-group>
  </form>`;

enum TestValue {
  First,
  Second,
  Third,
}

@Component({
  selector: "app-example",
  template,
})
class ExampleComponent {
  protected TestValue = TestValue;

  protected formObj = this.formBuilder.group({
    radio: TestValue.First,
  });

  @Input() label: boolean;

  @Input() set selected(value: TestValue) {
    this.formObj.patchValue({ radio: value });
  }

  @Input() set disabled(disable: boolean) {
    if (disable) {
      this.formObj.disable();
    } else {
      this.formObj.enable();
    }
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
    disabled: false,
    label: true,
  },
  argTypes: {
    selected: {
      options: [TestValue.First, TestValue.Second, TestValue.Third],
      control: {
        type: "inline-radio",
        labels: {
          [TestValue.First]: "First",
          [TestValue.Second]: "Second",
          [TestValue.Third]: "Third",
        },
      },
    },
  },
} as Meta;

const DefaultTemplate: Story<ExampleComponent> = (args: ExampleComponent) => ({
  props: args,
  template: `<app-example [selected]="selected" [disabled]="disabled" [label]="label"></app-example>`,
});

export const Default = DefaultTemplate.bind({});
