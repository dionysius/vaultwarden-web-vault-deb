import { Meta, Story } from "@storybook/angular";

import { BitIconButtonComponent, IconButtonType } from "./icon-button.component";

const buttonTypes: IconButtonType[] = [
  "contrast",
  "main",
  "muted",
  "primary",
  "secondary",
  "danger",
];

export default {
  title: "Component Library/Icon Button",
  component: BitIconButtonComponent,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=4369%3A16686",
    },
  },
  args: {
    bitIconButton: "bwi-plus",
    size: "default",
    disabled: false,
  },
  argTypes: {
    buttonTypes: { table: { disable: true } },
  },
} as Meta;

const Template: Story<BitIconButtonComponent> = (args: BitIconButtonComponent) => ({
  props: { ...args, buttonTypes },
  template: `
  <table class="tw-border-spacing-2 tw-text-center tw-text-main">
    <thead>
      <tr>
        <td></td>
        <td *ngFor="let buttonType of buttonTypes" class="tw-capitalize tw-font-bold tw-p-4"
          [class.tw-text-contrast]="buttonType === 'contrast'"
          [class.tw-bg-primary-500]="buttonType === 'contrast'">{{buttonType}}</td>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td class="tw-font-bold tw-p-4 tw-text-left">Default</td>
          <td *ngFor="let buttonType of buttonTypes" class="tw-p-2" [class.tw-bg-primary-500]="buttonType === 'contrast'">
            <button
              [bitIconButton]="bitIconButton"
              [buttonType]="buttonType"
              [size]="size"
              title="Example icon button"
              aria-label="Example icon button"></button>
          </td>
      </tr>

      <tr>
        <td class="tw-font-bold tw-p-4 tw-text-left">Disabled</td>
          <td *ngFor="let buttonType of buttonTypes" class="tw-p-2" [class.tw-bg-primary-500]="buttonType === 'contrast'">
            <button
              [bitIconButton]="bitIconButton"
              [buttonType]="buttonType"
              [size]="size"
              disabled
              title="Example icon button"
              aria-label="Example icon button"></button>
          </td>
      </tr>

      <tr>
        <td class="tw-font-bold tw-p-4 tw-text-left">Loading</td>
          <td *ngFor="let buttonType of buttonTypes" class="tw-p-2" [class.tw-bg-primary-500]="buttonType === 'contrast'">
            <button
              [bitIconButton]="bitIconButton"
              [buttonType]="buttonType"
              [size]="size"
              loading="true"
              title="Example icon button"
              aria-label="Example icon button"></button>
          </td>
      </tr>
    </tbody>
  </table>
  `,
});

export const Default = Template.bind({});
Default.args = {
  size: "default",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
};
