import { RouterTestingModule } from "@angular/router/testing";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SharedModule } from "../shared/shared.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { NavGroupComponent } from "./nav-group.component";
import { NavigationModule } from "./navigation.module";

export default {
  title: "Component Library/Nav/Nav Group",
  component: NavGroupComponent,
  decorators: [
    moduleMetadata({
      imports: [SharedModule, RouterTestingModule, NavigationModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              submenu: "submenu",
              toggleCollapse: "toggle collapse",
            });
          },
        },
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=4687%3A86642",
    },
  },
} as Meta;

export const Default: Story<NavGroupComponent> = (args) => ({
  props: args,
  template: `
      <bit-nav-group text="Hello World (Anchor)" [route]="['']" icon="bwi-filter" [open]="true">
        <bit-nav-item text="Child A" route="#" icon="bwi-filter"></bit-nav-item>
        <bit-nav-item text="Child B" route="#"></bit-nav-item>
        <bit-nav-item text="Child C" route="#" icon="bwi-filter"></bit-nav-item>
      </bit-nav-group>
      <bit-nav-group text="Lorem Ipsum (Button)" icon="bwi-filter">
        <bit-nav-item text="Child A" icon="bwi-filter"></bit-nav-item>
        <bit-nav-item text="Child B"></bit-nav-item>
        <bit-nav-item text="Child C" icon="bwi-filter"></bit-nav-item>
      </bit-nav-group>
    `,
});

export const Tree: Story<NavGroupComponent> = (args) => ({
  props: args,
  template: `
    <bit-nav-group text="Tree example" icon="bwi-collection" [open]="true">
      <bit-nav-group text="Level 1 - with children (empty)" route="#" icon="bwi-collection" variant="tree"></bit-nav-group>
      <bit-nav-item text="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></bit-nav-item>
      <bit-nav-group text="Level 1 - with children" route="#" icon="bwi-collection" variant="tree" [open]="true">
        <bit-nav-group text="Level 2 - with children" route="#" icon="bwi-collection" variant="tree" [open]="true">
          <bit-nav-item text="Level 3 - no childen, no icon" route="#" variant="tree"></bit-nav-item>
          <bit-nav-group text="Level 3 - with children" route="#" icon="bwi-collection" variant="tree" [open]="true">
            <bit-nav-item text="Level 4 - no childen, no icon" route="#" variant="tree"></bit-nav-item>
          </bit-nav-group>
        </bit-nav-group>
        <bit-nav-group text="Level 2 - with children (empty)" route="#" icon="bwi-collection" variant="tree" [open]="true"></bit-nav-group>
        <bit-nav-item text="Level 2 - no childen" route="#" icon="bwi-collection" variant="tree"></bit-nav-item>
      </bit-nav-group>
      <bit-nav-item text="Level 1 - no childen" route="#" icon="bwi-collection" variant="tree"></bit-nav-item>
    </bit-nav-group>
  `,
});
