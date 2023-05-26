import { CommonModule } from "@angular/common";
import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { BadgeDirective } from "./badge.directive";

export default {
  title: "Component Library/Badge",
  component: BadgeDirective,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
      declarations: [BadgeDirective],
    }),
  ],
  args: {
    badgeType: "primary",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A16956",
    },
  },
} as Meta<BadgeDirective>;

type Story = StoryObj<BadgeDirective>;

export const Primary: Story = {
  render: (args) => ({
    props: args,
    template: `
      <span class="tw-text-main">Span </span><span bitBadge [badgeType]="badgeType">Badge</span>
      <br><br>
      <span class="tw-text-main">Link </span><a href="#" bitBadge [badgeType]="badgeType">Badge</a>
      <br><br>
      <span class="tw-text-main">Button </span><button bitBadge [badgeType]="badgeType">Badge</button>
    `,
  }),
};

export const Secondary: Story = {
  ...Primary,
  args: {
    badgeType: "secondary",
  },
};

export const Success: Story = {
  ...Primary,
  args: {
    badgeType: "success",
  },
};

export const Danger: Story = {
  ...Primary,
  args: {
    badgeType: "danger",
  },
};

export const Warning: Story = {
  ...Primary,
  args: {
    badgeType: "warning",
  },
};

export const Info: Story = {
  ...Primary,
  args: {
    badgeType: "info",
  },
};
