import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../../button";
import { DialogTitleContainerDirective } from "../directives/dialog-title-container.directive";

import { IconDirective, SimpleDialogComponent } from "./simple-dialog.component";

export default {
  title: "Component Library/Dialogs/Simple Dialog",
  component: SimpleDialogComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule],
      declarations: [IconDirective, DialogTitleContainerDirective],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<SimpleDialogComponent> = (args: SimpleDialogComponent) => ({
  props: args,
  template: `
  <bit-simple-dialog>
      <span bitDialogTitle>Alert Dialog</span>
      <span bitDialogContent>Message Content</span>
      <div bitDialogFooter class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary">Yes</button>
        <button bitButton buttonType="secondary">No</button>
      </div>
  </bit-simple-dialog>
  `,
});

export const Default = Template.bind({});

const TemplateWithIcon: Story<SimpleDialogComponent> = (args: SimpleDialogComponent) => ({
  props: args,
  template: `
  <bit-simple-dialog>
      <i bit-dialog-icon class="bwi bwi-star tw-text-3xl tw-text-success" aria-hidden="true"></i>
      <span bitDialogTitle>Premium Subscription Available</span>
      <span bitDialogContent> Message Content</span>
      <div bitDialogFooter class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary">Yes</button>
        <button bitButton buttonType="secondary">No</button>
      </div>
  </bit-simple-dialog>
  `,
});

export const CustomIcon = TemplateWithIcon.bind({});

const TemplateScroll: Story<SimpleDialogComponent> = (args: SimpleDialogComponent) => ({
  props: args,
  template: `
  <bit-simple-dialog>
      <span bitDialogTitle>Alert Dialog</span>
      <span bitDialogContent>
        Message Content
        Message text goes here.<br>
        <ng-container *ngFor="let _ of [].constructor(100)">
          repeating lines of characters <br>
        </ng-container>
        end of sequence!
      </span>
      <div bitDialogFooter class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary">Yes</button>
        <button bitButton buttonType="secondary">No</button>
      </div>
  </bit-simple-dialog>
  `,
});

export const ScrollingContent = TemplateScroll.bind({});
ScrollingContent.args = {
  useDefaultIcon: true,
};
