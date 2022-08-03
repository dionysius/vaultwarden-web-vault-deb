import { Meta, Story } from "@storybook/angular";

import { BitIconComponent } from "./icon.component";

export default {
  title: "Component Library/Icon",
  component: BitIconComponent,
  args: {
    icon: "reportExposedPasswords",
  },
} as Meta;

const Template: Story<BitIconComponent> = (args: BitIconComponent) => ({
  props: args,
  template: `
  <div class="tw-bg-primary-500 tw-p-5">
    <bit-icon [icon]="icon" class="tw-text-primary-300"></bit-icon>
  </div>
  `,
});

export const ReportExposedPasswords = Template.bind({});

export const UnknownIcon = Template.bind({});
UnknownIcon.args = {
  icon: "unknown",
};
