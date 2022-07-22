import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { ButtonModule } from "../button";

import { IconDirective, ModalSimpleComponent } from "./modal-simple.component";

export default {
  title: "Component Library/Modals/Simple Modal",
  component: ModalSimpleComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule],
      declarations: [IconDirective],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library",
    },
  },
} as Meta;

const Template: Story<ModalSimpleComponent> = (args: ModalSimpleComponent) => ({
  props: args,
  template: `
  <bit-simple-modal>
      <span bit-modal-title> Alert Modal
      </span>
      <span bit-modal-content> Message Content
      </span>
      <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary"> Yes </button>
        <button bitButton buttonType="secondary"> No </button>
      </div>
  </bit-simple-modal>
  `,
});

export const Default = Template.bind({});

const TemplateWithIcon: Story<ModalSimpleComponent> = (args: ModalSimpleComponent) => ({
  props: args,
  template: `
  <bit-simple-modal>
      <i bit-modal-icon class="bwi bwi-star tw-text-3xl tw-text-success" aria-hidden="true"></i>
      <span bit-modal-title> Premium Subscription Available
      </span>
      <span bit-modal-content> Message Content
      </span>
      <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary"> Yes </button>
        <button bitButton buttonType="secondary"> No </button>
      </div>
  </bit-simple-modal>
  `,
});

export const CustomIcon = TemplateWithIcon.bind({});

const TemplateScroll: Story<ModalSimpleComponent> = (args: ModalSimpleComponent) => ({
  props: args,
  template: `
  <bit-simple-modal>
      <span bit-modal-title> Alert Modal
      </span>
      <span bit-modal-content> Message Content
      Message text goes here.<br>
      <ng-container *ngFor="let _ of [].constructor(100)">
      repeating lines of characters <br>
      </ng-container>
      end of sequence!
      </span>
      <div bit-modal-footer class="tw-flex tw-flex-row tw-gap-2">
        <button bitButton buttonType="primary"> Yes </button>
        <button bitButton buttonType="secondary"> No </button>
      </div>
  </bit-simple-modal>
  `,
});

export const ScrollingContent = TemplateScroll.bind({});
ScrollingContent.args = {
  useDefaultIcon: true,
};
