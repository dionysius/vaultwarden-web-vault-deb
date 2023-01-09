import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { IconButtonModule } from "../icon-button";
import { LinkModule } from "../link";
import { MenuModule } from "../menu";

import { BreadcrumbComponent } from "./breadcrumb.component";
import { BreadcrumbsComponent } from "./breadcrumbs.component";

interface Breadcrumb {
  icon?: string;
  name: string;
  route: string;
}

@Component({
  template: "",
})
class EmptyComponent {}

export default {
  title: "Component Library/Breadcrumbs",
  component: BreadcrumbsComponent,
  decorators: [
    moduleMetadata({
      declarations: [BreadcrumbComponent],
      imports: [
        LinkModule,
        MenuModule,
        IconButtonModule,
        RouterModule.forRoot([{ path: "**", component: EmptyComponent }], { useHash: true }),
      ],
    }),
  ],
  args: {
    items: [],
  },
  argTypes: {
    breadcrumbs: {
      table: { disable: true },
    },
    click: { action: "clicked" },
  },
} as Meta;

const Template: Story<BreadcrumbsComponent> = (args: BreadcrumbsComponent) => ({
  props: args,
  template: `
    <h3 class="tw-text-main">Router links</h3>
    <p>
      <bit-breadcrumbs [show]="show">
        <bit-breadcrumb *ngFor="let item of items" [icon]="item.icon" [route]="[item.route]">{{item.name}}</bit-breadcrumb>
      </bit-breadcrumbs>
    </p>

    <h3 class="tw-text-main">Click emit</h3>
    <p>
      <bit-breadcrumbs [show]="show">
        <bit-breadcrumb *ngFor="let item of items" [icon]="item.icon" (click)="click($event)">{{item.name}}</bit-breadcrumb>
      </bit-breadcrumbs>
    </p>
  `,
});

export const TopLevel = Template.bind({});
TopLevel.args = {
  items: [{ icon: "bwi-star", name: "Top Level" }] as Breadcrumb[],
};

export const SecondLevel = Template.bind({});
SecondLevel.args = {
  items: [
    { name: "Acme Vault", route: "/" },
    { icon: "bwi-collection", name: "Collection", route: "collection" },
  ] as Breadcrumb[],
};

export const Overflow = Template.bind({});
Overflow.args = {
  items: [
    { name: "Acme Vault", route: "" },
    { icon: "bwi-collection", name: "Collection", route: "collection" },
    { icon: "bwi-collection", name: "Middle-Collection 1", route: "middle-collection-1" },
    { icon: "bwi-collection", name: "Middle-Collection 2", route: "middle-collection-2" },
    { icon: "bwi-collection", name: "Middle-Collection 3", route: "middle-collection-3" },
    { icon: "bwi-collection", name: "Middle-Collection 4", route: "middle-collection-4" },
    { icon: "bwi-collection", name: "End Collection", route: "end-collection" },
  ] as Breadcrumb[],
};
