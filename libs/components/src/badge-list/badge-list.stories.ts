import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { BadgeModule } from "../badge";
import { SharedModule } from "../shared";
import { I18nMockService } from "../utils/i18n-mock.service";

import { BadgeListComponent } from "./badge-list.component";

export default {
  title: "Component Library/Badge/List",
  component: BadgeListComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule, BadgeModule],
      declarations: [BadgeListComponent],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              plusNMore: (n) => `+ ${n} more`,
            });
          },
        },
      ],
    }),
  ],
  args: {
    badgeType: "primary",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/f32LSg3jaegICkMu7rPARm/Tailwind-Component-Library-Update?node-id=1881%3A16956",
    },
  },
} as Meta;

const ListTemplate: Story<BadgeListComponent> = (args: BadgeListComponent) => ({
  props: args,
  template: `
    <bit-badge-list [badgeType]="badgeType" [maxItems]="maxItems" [items]="items"></bit-badge-list>
  `,
});

export const Default = ListTemplate.bind({});
Default.args = {
  badgeType: "info",
  maxItems: 3,
  items: ["Badge 1", "Badge 2", "Badge 3", "Badge 4", "Badge 5"],
};
