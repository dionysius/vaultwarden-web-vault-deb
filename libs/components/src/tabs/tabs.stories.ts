import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { TabGroupComponent } from "./tab-group.component";
import { TabItemComponent } from "./tab-item.component";

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
        TabGroupComponent,
        TabItemComponent,
        ActiveDummyComponent,
        ItemTwoDummyComponent,
        ItemThreeDummyComponent,
        DisabledDummyComponent,
      ],
      imports: [
        CommonModule,
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

const TabGroupTemplate: Story<TabGroupComponent> = (args: TabGroupComponent) => ({
  props: args,
  template: `
    <bit-tab-group>
      <bit-tab-item [route]="['active']">Active</bit-tab-item>
      <bit-tab-item [route]="['item-2']">Item 2</bit-tab-item>
      <bit-tab-item [route]="['item-3']">Item 3</bit-tab-item>
      <bit-tab-item [route]="['disabled']" [disabled]="true">Disabled</bit-tab-item>
    </bit-tab-group>
    <div class="tw-bg-transparent tw-text-semibold tw-text-center !tw-text-main tw-py-10">
      <router-outlet></router-outlet>
    </div>
  `,
});

export const TabGroup = TabGroupTemplate.bind({});
