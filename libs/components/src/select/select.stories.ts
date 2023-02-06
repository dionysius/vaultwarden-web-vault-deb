import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { MultiSelectComponent } from "../multi-select/multi-select.component";
import { I18nMockService } from "../utils/i18n-mock.service";

import { SelectComponent } from "./select.component";
import { SelectModule } from "./select.module";

export default {
  title: "Component Library/Form/Select",
  component: SelectComponent,
  decorators: [
    moduleMetadata({
      imports: [SelectModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              selectPlaceholder: "-- Select --",
            });
          },
        },
      ],
    }),
  ],
  args: {
    disabled: false,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/3tWtMSYoLB0ZLEimLNzYsm/End-user-%26-admin-Vault-Refresh?t=7QEmGA69YTOF8sXU-0",
    },
  },
} as Meta;

const DefaultTemplate: Story<MultiSelectComponent> = (args: MultiSelectComponent) => ({
  props: {
    ...args,
  },
  template: `<bit-select [disabled]="disabled">
      <bit-option value="value1" label="Value 1" icon="bwi-collection"></bit-option>
      <bit-option value="value2" label="Value 2" icon="bwi-collection"></bit-option>
      <bit-option value="value3" label="Value 3" icon="bwi-collection"></bit-option>
      <bit-option value="value4" label="Value 4" icon="bwi-collection" disabled></bit-option>
    </bit-select>`,
});

export const Default = DefaultTemplate.bind({});
Default.args = {};

export const Disabled = DefaultTemplate.bind({});
Disabled.args = {
  disabled: true,
};
