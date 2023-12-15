import { RouterTestingModule } from "@angular/router/testing";
import { Meta, StoryObj, componentWrapperDecorator, moduleMetadata } from "@storybook/angular";
import { userEvent } from "@storybook/testing-library";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { CalloutModule } from "../callout";
import { NavigationModule } from "../navigation";
import { I18nMockService } from "../utils/i18n-mock.service";

import { LayoutComponent } from "./layout.component";

export default {
  title: "Component Library/Layout",
  component: LayoutComponent,
  decorators: [
    componentWrapperDecorator(
      /**
       * Applying a CSS transform makes a `position: fixed` element act like it is `position: relative`
       * https://github.com/storybookjs/storybook/issues/8011#issue-490251969
       */
      (story) =>
        /* HTML */ `<div class="tw-scale-100 tw-border-2 tw-border-solid tw-border-[red]">
          ${story}
        </div>`,
    ),
    moduleMetadata({
      imports: [NavigationModule, RouterTestingModule, CalloutModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              skipToContent: "Skip to content",
              submenu: "submenu",
              toggleCollapse: "toggle collapse",
            });
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LayoutComponent>;

export const Empty: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `<bit-layout></bit-layout>`,
  }),
};

export const WithContent: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <bit-layout>
        <nav slot="sidebar">
          <bit-nav-item text="Item A" icon="bwi-collection"></bit-nav-item>
          <bit-nav-item text="Item B" icon="bwi-collection"></bit-nav-item>
          <bit-nav-divider></bit-nav-divider>
          <bit-nav-item text="Item C" icon="bwi-collection"></bit-nav-item>
          <bit-nav-item text="Item D" icon="bwi-collection"></bit-nav-item>
          <bit-nav-group text="Tree example" icon="bwi-collection" [open]="true">
            <bit-nav-group
              text="Level 1 - with children (empty)"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-group>
            <bit-nav-item
              text="Level 1 - no children"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-item>
            <bit-nav-group
              text="Level 1 - with children"
              route="#"
              icon="bwi-collection"
              variant="tree"
              [open]="true"
            >
              <bit-nav-group
                text="Level 2 - with children"
                route="#"
                icon="bwi-collection"
                variant="tree"
                [open]="true"
              >
                <bit-nav-item
                  text="Level 3 - no children, no icon"
                  route="#"
                  variant="tree"
                ></bit-nav-item>
                <bit-nav-group
                  text="Level 3 - with children"
                  route="#"
                  icon="bwi-collection"
                  variant="tree"
                  [open]="true"
                >
                  <bit-nav-item
                    text="Level 4 - no children, no icon"
                    route="#"
                    variant="tree"
                  ></bit-nav-item>
                </bit-nav-group>
              </bit-nav-group>
              <bit-nav-group
                text="Level 2 - with children (empty)"
                route="#"
                icon="bwi-collection"
                variant="tree"
                [open]="true"
              ></bit-nav-group>
              <bit-nav-item
                text="Level 2 - no children"
                route="#"
                icon="bwi-collection"
                variant="tree"
              ></bit-nav-item>
            </bit-nav-group>
            <bit-nav-item
              text="Level 1 - no children"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-item>
          </bit-nav-group>
        </nav>
        <bit-callout title="Foobar"> Hello world! </bit-callout>
      </bit-layout>
    `,
  }),
};

export const SkipLinks: Story = {
  ...WithContent,
  play: async () => {
    await userEvent.tab();
  },
};

export const Secondary: Story = {
  render: (args) => ({
    props: args,
    template: /* HTML */ `
      <bit-layout variant="secondary">
        <nav slot="sidebar">
          <bit-nav-item text="Item A" icon="bwi-collection"></bit-nav-item>
          <bit-nav-item text="Item B" icon="bwi-collection"></bit-nav-item>
          <bit-nav-divider></bit-nav-divider>
          <bit-nav-item text="Item C" icon="bwi-collection"></bit-nav-item>
          <bit-nav-item text="Item D" icon="bwi-collection"></bit-nav-item>
          <bit-nav-group text="Tree example" icon="bwi-collection" [open]="true">
            <bit-nav-group
              text="Level 1 - with children (empty)"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-group>
            <bit-nav-item
              text="Level 1 - no children"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-item>
            <bit-nav-group
              text="Level 1 - with children"
              route="#"
              icon="bwi-collection"
              variant="tree"
              [open]="true"
            >
              <bit-nav-group
                text="Level 2 - with children"
                route="#"
                icon="bwi-collection"
                variant="tree"
                [open]="true"
              >
                <bit-nav-item
                  text="Level 3 - no children, no icon"
                  route="#"
                  variant="tree"
                ></bit-nav-item>
                <bit-nav-group
                  text="Level 3 - with children"
                  route="#"
                  icon="bwi-collection"
                  variant="tree"
                  [open]="true"
                >
                  <bit-nav-item
                    text="Level 4 - no children, no icon"
                    route="#"
                    variant="tree"
                  ></bit-nav-item>
                </bit-nav-group>
              </bit-nav-group>
              <bit-nav-group
                text="Level 2 - with children (empty)"
                route="#"
                icon="bwi-collection"
                variant="tree"
                [open]="true"
              ></bit-nav-group>
              <bit-nav-item
                text="Level 2 - no children"
                route="#"
                icon="bwi-collection"
                variant="tree"
              ></bit-nav-item>
            </bit-nav-group>
            <bit-nav-item
              text="Level 1 - no children"
              route="#"
              icon="bwi-collection"
              variant="tree"
            ></bit-nav-item>
          </bit-nav-group>
        </nav>
        <bit-callout title="Foobar"> Hello world! </bit-callout>
      </bit-layout>
    `,
  }),
};
