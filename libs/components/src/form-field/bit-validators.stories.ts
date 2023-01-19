import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { ButtonModule } from "../button";
import { InputModule } from "../input/input.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { forbiddenCharacters } from "./bit-validators/forbidden-characters.validator";
import { BitFormFieldComponent } from "./form-field.component";
import { FormFieldModule } from "./form-field.module";

export default {
  title: "Component Library/Form/Custom Validators",
  component: BitFormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule, ReactiveFormsModule, FormFieldModule, InputModule, ButtonModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              inputForbiddenCharacters: (chars) =>
                `The following characters are not allowed: ${chars}`,
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/f32LSg3jaegICkMu7rPARm/Tailwind-Component-Library-Update?node-id=1881%3A17689",
    },
  },
} as Meta;

const template = `
  <form [formGroup]="formObj">
    <bit-form-field>
      <bit-label>Name</bit-label>
      <input bitInput formControlName="name" />
    </bit-form-field>
  </form>`;

export const ForbiddenCharacters: Story<BitFormFieldComponent> = (args: BitFormFieldComponent) => ({
  props: {
    formObj: new FormBuilder().group({
      name: ["", forbiddenCharacters(["\\", "/", "@", "#", "$", "%", "^", "&", "*", "(", ")"])],
    }),
  },
  template,
});
