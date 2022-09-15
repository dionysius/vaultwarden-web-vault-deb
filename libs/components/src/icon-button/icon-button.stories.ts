import { Meta, Story } from "@storybook/angular";

import { BitIconButtonComponent } from "./icon-button.component";

export default {
  title: "Component Library/Icon Button",
  component: BitIconButtonComponent,
  args: {
    bitIconButton: "bwi-plus",
    buttonType: "primary",
    size: "default",
    disabled: false,
  },
} as Meta;

const Template: Story<BitIconButtonComponent> = (args: BitIconButtonComponent) => ({
  props: args,
  template: `
  <div class="tw-p-5" [class.tw-bg-primary-500]="buttonType === 'contrast'">
    <button
      [bitIconButton]="bitIconButton"
      [buttonType]="buttonType"
      [size]="size"
      [disabled]="disabled"
      title="Example icon button"
      aria-label="Example icon button"></button>
  </div>
  `,
});

export const Contrast = Template.bind({});
Contrast.args = {
  buttonType: "contrast",
};

export const Main = Template.bind({});
Main.args = {
  buttonType: "main",
};

export const Muted = Template.bind({});
Muted.args = {
  buttonType: "muted",
};

export const Primary = Template.bind({});
Primary.args = {
  buttonType: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  buttonType: "secondary",
};

export const Danger = Template.bind({});
Danger.args = {
  buttonType: "danger",
};
