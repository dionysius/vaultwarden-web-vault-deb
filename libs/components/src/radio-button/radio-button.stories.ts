import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from "@angular/forms";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { I18nMockService } from "../utils/i18n-mock.service";

import { RadioButtonModule } from "./radio-button.module";
import { RadioGroupComponent } from "./radio-group.component";

export default {
  title: "Component Library/Form/Radio Button",
  component: RadioGroupComponent,
  decorators: [
    moduleMetadata({
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
} as Meta<RadioGroupComponent>;

type Story = StoryObj<RadioGroupComponent>;

export const Inline: Story = {
  render: () => ({
    props: {
      formObj: new FormGroup({
        radio: new FormControl(0),
      }),
    },
    template: `
      <form [formGroup]="formObj">
        <bit-radio-group formControlName="radio" aria-label="Example radio group">
          <bit-label>Group of radio buttons</bit-label>
  
          <bit-radio-button id="radio-first" [value]="0">
            <bit-label>First</bit-label>
          </bit-radio-button>
  
          <bit-radio-button id="radio-second" [value]="1">
            <bit-label>Second</bit-label>
          </bit-radio-button>
  
          <bit-radio-button id="radio-third" [value]="2">
            <bit-label>Third</bit-label>
          </bit-radio-button>
        </bit-radio-group>
      </form>
    `,
  }),
};

export const Block: Story = {
  render: () => ({
    props: {
      formObj: new FormGroup({
        radio: new FormControl(0),
      }),
    },
    template: `
      <form [formGroup]="formObj">
        <bit-radio-group formControlName="radio" aria-label="Example radio group">
          <bit-label>Group of radio buttons</bit-label>
  
          <bit-radio-button id="radio-first" class="tw-block" [value]="0">
            <bit-label>First</bit-label>
            <bit-hint>This is a hint for the first option</bit-hint>
          </bit-radio-button>
  
          <bit-radio-button id="radio-second" class="tw-block" [value]="1">
            <bit-label>Second</bit-label>
            <bit-hint>This is a hint for the second option</bit-hint>
          </bit-radio-button>
  
          <bit-radio-button id="radio-third" class="tw-block" [value]="2">
            <bit-label>Third</bit-label>
            <bit-hint>This is a hint for the third option</bit-hint>
          </bit-radio-button>
        </bit-radio-group>
      </form>
    `,
  }),
};
