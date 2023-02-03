import { Meta, Story } from "@storybook/angular";

import { TypographyDirective } from "./typography.directive";

export default {
  title: "Component Library/Typography",
  component: TypographyDirective,
  args: {
    bitTypography: "body1",
  },
} as Meta;

const Template: Story = (args) => ({
  props: args,
  template: `<span [bitTypography]="bitTypography" class="tw-text-main">{{text}}</span>`,
});

export const H1 = Template.bind({});
H1.args = {
  bitTypography: "h1",
  text: "h1. Page Title",
};

export const H2 = Template.bind({});
H2.args = {
  bitTypography: "h2",
  text: "h2. Page Section",
};

export const H3 = Template.bind({});
H3.args = {
  bitTypography: "h3",
  text: "h3. Page Section",
};

export const H4 = Template.bind({});
H4.args = {
  bitTypography: "h4",
  text: "h4. Page Section",
};

export const H5 = Template.bind({});
H5.args = {
  bitTypography: "h5",
  text: "h5. Page Section",
};

export const H6 = Template.bind({});
H6.args = {
  bitTypography: "h6",
  text: "h6. Page Section",
};

export const Body1 = Template.bind({});
Body1.args = {
  bitTypography: "body1",
  text: "Body 1",
};

export const Body2 = Template.bind({});
Body2.args = {
  bitTypography: "body2",
  text: "Body 2",
};

export const Helper = Template.bind({});
Helper.args = {
  bitTypography: "helper",
  text: "Helper Text",
};
