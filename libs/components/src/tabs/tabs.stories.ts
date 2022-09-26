import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { TabGroupComponent } from "./tab-group/tab-group.component";
import { TabsModule } from "./tabs.module";

@Component({
  selector: "bit-tab-active-dummy",
  template: "Router - Active selected",
})
class ActiveDummyComponent {}

@Component({
  selector: "bit-tab-item-2-dummy",
  template: "Router - Item 2 selected",
})
class ItemTwoDummyComponent {}

@Component({
  selector: "bit-tab-item-3-dummy",
  template: "Router - Item 3 selected",
})
class ItemThreeDummyComponent {}

@Component({
  selector: "bit-tab-disabled-dummy",
  template: "Router - Disabled selected",
})
class DisabledDummyComponent {}

export default {
  title: "Component Library/Tabs",
  component: TabGroupComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        ActiveDummyComponent,
        ItemTwoDummyComponent,
        ItemThreeDummyComponent,
        DisabledDummyComponent,
      ],
      imports: [
        CommonModule,
        TabsModule,
        RouterModule.forRoot(
          [
            { path: "", redirectTo: "active", pathMatch: "full" },
            { path: "active", component: ActiveDummyComponent },
            { path: "item-2", component: ItemTwoDummyComponent },
            { path: "item-3", component: ItemThreeDummyComponent },
            { path: "disabled", component: DisabledDummyComponent },
          ],
          { useHash: true }
        ),
      ],
    }),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A17922",
    },
  },
} as Meta;

const ContentTabGroupTemplate: Story<TabGroupComponent> = (args: any) => ({
  props: args,
  template: `
    <bit-tab-group label="Main Content Tabs" class="tw-text-main">
        <bit-tab label="First Tab">First Tab Content</bit-tab>
        <bit-tab label="Second Tab">Second Tab Content</bit-tab>
        <bit-tab>
          <ng-template bitTabLabel>
            <i class="bwi bwi-search tw-pr-1"></i> Template Label
          </ng-template>
          Template Label Content
        </bit-tab>
        <bit-tab [disabled]="true" label="Disabled">
          Disabled Content
        </bit-tab>
    </bit-tab-group>
  `,
});

export const ContentTabs = ContentTabGroupTemplate.bind({});

const NavTabGroupTemplate: Story<TabGroupComponent> = (args: TabGroupComponent) => ({
  props: args,
  template: `
    <bit-tab-nav-bar label="Main">
      <bit-tab-link [route]="['active']">Active</bit-tab-link>
      <bit-tab-link [route]="['item-2']">Item 2</bit-tab-link>
      <bit-tab-link [route]="['item-3']">Item 3</bit-tab-link>
      <bit-tab-link [route]="['disable']" [disabled]="true">Disabled</bit-tab-link>
    </bit-tab-nav-bar>
    <div class="tw-bg-transparent tw-text-semibold tw-text-center tw-text-main tw-py-10">
      <router-outlet></router-outlet>
    </div>
  `,
});

export const NavigationTabs = NavTabGroupTemplate.bind({});

const PreserveContentTabGroupTemplate: Story<TabGroupComponent> = (args: any) => ({
  props: args,
  template: `
    <bit-tab-group label="Preserve Content Tabs" [preserveContent]="true" class="tw-text-main">
        <bit-tab label="Text Tab">
          <p>
            Play the video in the other tab and switch back to hear the video is still playing.
          </p>
        </bit-tab>
        <bit-tab label="Video Tab">
          <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/H0-yWbe5XG4"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowfullscreen></iframe>
        </bit-tab>
    </bit-tab-group>
  `,
});

export const PreserveContentTabs = PreserveContentTabGroupTemplate.bind({});
