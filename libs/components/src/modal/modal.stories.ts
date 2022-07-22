import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { ModalComponent } from "./modal.component";

export default {
  title: "Component Library/Modals/Modal",
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule],
    }),
  ],
  args: {
    modalSize: "small",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<ModalComponent> = (args: ModalComponent) => ({
  props: args,
  template: `
  <bit-modal [modalSize]="modalSize">
    <span bit-modal-title> Modal Title </span>
    <span bit-modal-content>
    Modal body text goes here.
    </span>
    <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
      <button bitButton buttonType="primary"> Save </button>
      <button bitButton buttonType="secondary"> Cancel </button>
    </div>
  </bit-modal>
  `,
});

export const Default = Template.bind({});
Default.args = {
  modalSize: "default",
};

export const Small = Template.bind({});
Small.args = {
  modalSize: "small",
};

export const Large = Template.bind({});
Large.args = {
  modalSize: "large",
};

const TemplateScrolling: Story<ModalComponent> = (args: ModalComponent) => ({
  props: args,
  template: `
  <bit-modal [modalSize]="modalSize">
  <span bit-modal-title> Modal Title </span>
  <span bit-modal-content>
    Modal body text goes here.<br>
    <ng-container *ngFor="let _ of [].constructor(100)">
      repeating lines of characters <br>
    </ng-container>
    end of sequence!
  </span>
  <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
    <button bitButton buttonType="primary"> Save </button>
    <button bitButton buttonType="secondary"> Cancel </button>
  </div>
  </bit-modal>
  `,
});

export const ScrollingContent = TemplateScrolling.bind({});
ScrollingContent.args = {
  modalSize: "small",
};
