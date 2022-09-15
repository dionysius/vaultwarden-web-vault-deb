import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { ButtonModule } from "../../button";
import { IconButtonModule } from "../../icon-button";
import { SharedModule } from "../../shared";
import { I18nMockService } from "../../utils/i18n-mock.service";
import { DialogCloseDirective } from "../directives/dialog-close.directive";
import { DialogTitleContainerDirective } from "../directives/dialog-title-container.directive";

import { DialogComponent } from "./dialog.component";

export default {
  title: "Component Library/Dialogs/Dialog",
  component: DialogComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule, SharedModule, IconButtonModule],
      declarations: [DialogTitleContainerDirective, DialogCloseDirective],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              close: "Close",
            });
          },
        },
      ],
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
    <span bitDialogTitle>{{title}}</span>
    <span bitDialogContent>Dialog body text goes here.</span>
    <div bitDialogFooter class="tw-flex tw-items-center tw-flex-row tw-gap-2">
      <button bitButton buttonType="primary">Save</button>
      <button bitButton buttonType="secondary">Cancel</button>
      <button
        class="tw-ml-auto"
        bitIconButton="bwi-trash"
        buttonType="danger"
        size="default"
        title="Delete"
        aria-label="Delete"></button>
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
  <span bitDialogTitle>Scrolling Example</span>
  <span bitDialogContent>
    Dialog body text goes here.<br>
    <ng-container *ngFor="let _ of [].constructor(100)">
      repeating lines of characters <br>
    </ng-container>
    end of sequence!
  </span>
  <div bitDialogFooter class="tw-flex tw-flex-row tw-gap-2">
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
