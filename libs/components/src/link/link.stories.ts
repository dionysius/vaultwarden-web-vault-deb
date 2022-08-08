import { Meta, Story } from "@storybook/angular";

import { LinkDirective } from "./link.directive";

export default {
  title: "Component Library/Link",
  component: LinkDirective,
  argTypes: {
    linkType: {
      options: ["primary", "secondary", "contrast"],
      control: { type: "radio" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A17419",
    },
  },
} as Meta;

const ButtonTemplate: Story<LinkDirective> = (args: LinkDirective) => ({
  props: args,
  template: `
  <div class="tw-p-2" [ngClass]="{ 'tw-bg-transparent': linkType != 'contrast', 'tw-bg-primary-500': linkType === 'contrast' }">
    <button bitLink [linkType]="linkType" class="tw-mb-2 tw-block">Button</button>
    <button bitLink [linkType]="linkType" class="tw-mb-2 tw-block">
      <i class="bwi bwi-fw bwi-plus-circle" aria-hidden="true"></i>
      Add Icon Button
    </button>
    <button bitLink [linkType]="linkType" class="tw-mb-2 tw-block">
      Chevron Icon Button
      <i class="bwi bwi-fw bwi-sm bwi-angle-down" aria-hidden="true"></i>
    </button>
    <button bitLink [linkType]="linkType" class="tw-text-sm tw-block">Small Button</button>
  </div>
  `,
});

const AnchorTemplate: Story<LinkDirective> = (args: LinkDirective) => ({
  props: args,
  template: `
  <div class="tw-p-2" [ngClass]="{ 'tw-bg-transparent': linkType != 'contrast', 'tw-bg-primary-500': linkType === 'contrast' }">
    <div class="tw-block tw-p-2">
      <a bitLink [linkType]="linkType" href="#">Anchor</a>
    </div>
    <div class="tw-block tw-p-2">
      <a bitLink [linkType]="linkType" href="#">
        <i class="bwi bwi-fw bwi-plus-circle" aria-hidden="true"></i>
        Add Icon Anchor
      </a>
    </div>
    <div class="tw-block tw-p-2">
      <a bitLink [linkType]="linkType" href="#">
        Chevron Icon Anchor
        <i class="bwi bwi-fw bwi-sm bwi-angle-down" aria-hidden="true"></i>
      </a>
    </div>
    <div class="tw-block tw-p-2">
      <a bitLink [linkType]="linkType" class="tw-text-sm" href="#">Small Anchor</a>
    </div>
  </div>
  `,
});

export const Buttons = ButtonTemplate.bind({});
Buttons.args = {
  linkType: "primary",
};

export const Anchors = AnchorTemplate.bind({});
Anchors.args = {
  linkType: "primary",
};

const DisabledTemplate: Story = (args) => ({
  props: args,
  template: `
    <button bitLink disabled linkType="primary" class="tw-mr-2">Primary</button>
    <button bitLink disabled linkType="secondary" class="tw-mr-2">Secondary</button>
    <div class="tw-bg-primary-500 tw-p-2 tw-inline-block">
      <button bitLink disabled linkType="contrast" class="tw-mr-2">Contrast</button>
    </div>
  `,
});

export const Disabled = DisabledTemplate.bind({});
Disabled.parameters = {
  controls: {
    exclude: ["linkType"],
    hideNoControlsWarning: true,
  },
};
