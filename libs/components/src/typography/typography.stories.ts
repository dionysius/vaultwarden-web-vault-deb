import { Meta, StoryObj } from "@storybook/angular";

import { TypographyDirective } from "./typography.directive";

export default {
  title: "Component Library/Typography",
  component: TypographyDirective,
  args: {
    bitTypography: "body1",
  },
} as Meta;

type Story = StoryObj<TypographyDirective & { text: string }>;

export const H1: Story = {
  render: (args) => ({
    props: args,
    template: `<span [bitTypography]="bitTypography" class="tw-text-main">{{text}}</span>`,
  }),
  args: {
    bitTypography: "h1",
    text: "h1. Page Title",
  },
};

export const H2: Story = {
  ...H1,
  args: {
    bitTypography: "h2",
    text: "h2. Page Section",
  },
};

export const H3: Story = {
  ...H1,
  args: {
    bitTypography: "h3",
    text: "h3. Page Section",
  },
};

export const H4: Story = {
  ...H1,
  args: {
    bitTypography: "h4",
    text: "h4. Page Section",
  },
};

export const H5: Story = {
  ...H1,

  args: {
    bitTypography: "h5",
    text: "h5. Page Section",
  },
};

export const H6: Story = {
  ...H1,

  args: {
    bitTypography: "h6",
    text: "h6. Page Section",
  },
};

export const Body1: Story = {
  ...H1,
  args: {
    bitTypography: "body1",
    text: "Body 1",
  },
};

export const Body2: Story = {
  ...H1,
  args: {
    bitTypography: "body2",
    text: "Body 2",
  },
};

export const Helper: Story = {
  ...H1,
  args: {
    bitTypography: "helper",
    text: "Helper Text",
  },
};
