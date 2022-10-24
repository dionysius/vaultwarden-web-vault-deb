import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { IconButtonModule } from "../icon-button";
import { SharedModule } from "../shared/shared.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { BannerComponent } from "./banner.component";

export default {
  title: "Component Library/Banner",
  component: BannerComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule, IconButtonModule],
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
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=2070%3A17207",
    },
  },
  args: {
    bannerType: "warning",
  },
  argTypes: {
    onClose: { action: "onClose" },
  },
} as Meta;

const Template: Story<BannerComponent> = (args: BannerComponent) => ({
  props: args,
  template: `
    <bit-banner [bannerType]="bannerType" (onClose)="onClose($event)">
        Content Really Long Text Lorem Ipsum Ipsum Ipsum
        <button>Button</button>
    </bit-banner>
  `,
});

export const Premium = Template.bind({});
Premium.args = {
  bannerType: "premium",
};

export const Info = Template.bind({});
Info.args = {
  bannerType: "info",
};

export const Warning = Template.bind({});
Warning.args = {
  bannerType: "warning",
};

export const Danger = Template.bind({});
Danger.args = {
  bannerType: "danger",
};
