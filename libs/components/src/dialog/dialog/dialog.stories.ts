import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../../button";

import { DialogComponent } from "./dialog.component";

export default {
  title: "Component Library/Dialogs/Dialog",
  component: DialogComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule],
    }),
  ],
  args: {
    dialogSize: "small",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<DialogComponent> = (args: DialogComponent) => ({
  props: args,
  template: `
  <bit-dialog [dialogSize]="dialogSize">
    <span bit-dialog-title>{{title}}</span>
    <span bit-dialog-content>Dialog body text goes here.</span>
    <div bit-dialog-footer class="tw-flex tw-flex-row tw-gap-2">
      <button bitButton buttonType="primary">Save</button>
      <button bitButton buttonType="secondary">Cancel</button>
    </div>
  </bit-dialog>
  `,
});

export const Default = Template.bind({});
Default.args = {
  dialogSize: "default",
  title: "Default",
};

export const Small = Template.bind({});
Small.args = {
  dialogSize: "small",
  title: "Small",
};

export const Large = Template.bind({});
Large.args = {
  dialogSize: "large",
  title: "Large",
};

const TemplateScrolling: Story<DialogComponent> = (args: DialogComponent) => ({
  props: args,
  template: `
  <bit-dialog [dialogSize]="dialogSize">
  <span bit-dialog-title>Scrolling Example</span>
  <span bit-dialog-content>
    Dialog body text goes here.<br>
    <ng-container *ngFor="let _ of [].constructor(100)">
      repeating lines of characters <br>
    </ng-container>
    end of sequence!
  </span>
  <div bit-dialog-footer class="tw-flex tw-flex-row tw-gap-2">
    <button bitButton buttonType="primary">Save</button>
    <button bitButton buttonType="secondary">Cancel</button>
  </div>
  </bit-dialog>
  `,
});

export const ScrollingContent = TemplateScrolling.bind({});
ScrollingContent.args = {
  dialogSize: "small",
};
