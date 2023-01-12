import { ScrollingModule } from "@angular/cdk/scrolling";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { TableDataSource } from "./table-data-source";
import { TableModule } from "./table.module";

export default {
  title: "Component Library/Table",
  decorators: [
    moduleMetadata({
      imports: [TableModule, ScrollingModule],
    }),
  ],
  argTypes: {
    alignRowContent: {
      options: ["top", "middle", "bottom", "baseline"],
      control: { type: "select" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A18371",
    },
  },
} as Meta;

const Template: Story = (args) => ({
  props: args,
  template: `
    <bit-table>
      <ng-container header>
        <tr>
          <th bitCell>Header 1</th>
          <th bitCell>Header 2</th>
          <th bitCell>Header 3</th>
        </tr>
      </ng-container>
      <ng-template body>
        <tr bitRow [alignContent]="alignRowContent">
          <td bitCell>Cell 1</td>
          <td bitCell>Cell 2 <br> Multiline Cell</td>
          <td bitCell>Cell 3</td>
        </tr>
        <tr bitRow [alignContent]="alignRowContent">
          <td bitCell>Cell 4</td>
          <td bitCell>Cell 5</td>
          <td bitCell>Cell 6</td>
        </tr>
        <tr bitRow [alignContent]="alignRowContent">
          <td bitCell>Cell 7 <br> Multiline Cell</td>
          <td bitCell>Cell 8</td>
          <td bitCell>Cell 9</td>
        </tr>
      </ng-template>
    </bit-table>
    `,
});

export const Default = Template.bind({});
Default.args = {
  alignRowContent: "baseline",
};

const data = new TableDataSource<{ id: number; name: string; other: string }>();

data.data = [...Array(5).keys()].map((i) => ({
  id: i,
  name: `name-${i}`,
  other: `other-${i}`,
}));

const DataSourceTemplate: Story = (args) => ({
  props: {
    dataSource: data,
    sortFn: (a: any, b: any) => a.id - b.id,
  },
  template: `
    <bit-table [dataSource]="dataSource">
      <ng-container header>
        <tr>
          <th bitCell bitSortable="id" default>Id</th>
          <th bitCell bitSortable="name">Name</th>
          <th bitCell bitSortable="other" [fn]="sortFn">Other</th>
        </tr>
      </ng-container>
      <ng-template body let-rows$>
        <tr bitRow *ngFor="let r of rows$ | async">
          <td bitCell>{{ r.id }}</td>
          <td bitCell>{{ r.name }}</td>
          <td bitCell>{{ r.other }}</td>
        </tr>
      </ng-template>
    </bit-table>
    `,
});

export const DataSource = DataSourceTemplate.bind({});

const data2 = new TableDataSource<{ id: number; name: string; other: string }>();

data2.data = [...Array(100).keys()].map((i) => ({
  id: i,
  name: `name-${i}`,
  other: `other-${i}`,
}));

const ScrollableTemplate: Story = (args) => ({
  props: {
    dataSource: data2,
    sortFn: (a: any, b: any) => a.id - b.id,
  },
  template: `
    <cdk-virtual-scroll-viewport scrollWindow itemSize="47">
      <bit-table [dataSource]="dataSource">
        <ng-container header>
          <tr>
            <th bitCell bitSortable="id" default>Id</th>
            <th bitCell bitSortable="name">Name</th>
            <th bitCell bitSortable="other" [fn]="sortFn">Other</th>
          </tr>
        </ng-container>
        <ng-template body let-rows$>
          <tr bitRow *cdkVirtualFor="let r of rows$">
            <td bitCell>{{ r.id }}</td>
            <td bitCell>{{ r.name }}</td>
            <td bitCell>{{ r.other }}</td>
          </tr>
        </ng-template>
      </bit-table>
    </cdk-virtual-scroll-viewport>
    `,
});

export const Scrollable = ScrollableTemplate.bind({});
