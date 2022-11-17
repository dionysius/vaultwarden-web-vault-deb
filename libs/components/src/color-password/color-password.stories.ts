import { Meta, Story } from "@storybook/angular";

import { ColorPasswordComponent } from "./color-password.component";

const examplePassword = "Wq$Jk😀7jDX#rS5Sdi!z";

export default {
  title: "Component Library/Color Password",
  component: ColorPasswordComponent,
  args: {
    password: examplePassword,
    showCount: false,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/6fvTDa3zfvgWdizLQ7nSTP/Numbered-Password",
    },
  },
} as Meta;

const Template: Story<ColorPasswordComponent> = (args: ColorPasswordComponent) => ({
  props: args,
  template: `
  <bit-color-password class="tw-text-base" [password]="password" [showCount]="showCount"></bit-color-password>
  `,
});

const WrappedTemplate: Story<ColorPasswordComponent> = (args: ColorPasswordComponent) => ({
  props: args,
  template: `
  <div class="tw-max-w-32">
    <bit-color-password class="tw-text-base" [password]="password" [showCount]="showCount"></bit-color-password>
  </div>
  `,
});

export const ColorPassword = Template.bind({});

export const WrappedColorPassword = WrappedTemplate.bind({});

export const ColorPasswordCount = Template.bind({});
ColorPasswordCount.args = {
  password: examplePassword,
  showCount: true,
};

export const WrappedColorPasswordCount = WrappedTemplate.bind({});
WrappedColorPasswordCount.args = {
  password: examplePassword,
  showCount: true,
};
