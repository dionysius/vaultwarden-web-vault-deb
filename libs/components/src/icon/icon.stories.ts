import { Meta, StoryObj } from "@storybook/angular";

import { BitIconComponent } from "./icon.component";

export default {
  title: "Component Library/Icon",
  component: BitIconComponent,
  args: {
    icon: "reportExposedPasswords",
  },
} as Meta;

type Story = StoryObj<BitIconComponent>;

export const ReportExposedPasswords: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="tw-bg-primary-500 tw-p-5">
      <bit-icon [icon]="icon" class="tw-text-primary-300"></bit-icon>
    </div>
    `,
  }),
};

export const UnknownIcon: Story = {
  ...ReportExposedPasswords,
  args: {
    icon: "unknown" as any,
  },
};
