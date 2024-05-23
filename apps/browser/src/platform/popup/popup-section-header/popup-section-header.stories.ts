import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import {
  CardComponent,
  IconButtonModule,
  SectionComponent,
  TypographyModule,
} from "@bitwarden/components";

import { PopupSectionHeaderComponent } from "./popup-section-header.component";

export default {
  title: "Browser/Popup Section Header",
  component: PopupSectionHeaderComponent,
  args: {
    title: "Title",
  },
  decorators: [
    moduleMetadata({
      imports: [SectionComponent, CardComponent, TypographyModule, IconButtonModule],
    }),
  ],
} as Meta<PopupSectionHeaderComponent>;

type Story = StoryObj<PopupSectionHeaderComponent>;

export const OnlyTitle: Story = {
  render: (args) => ({
    props: args,
    template: `
      <popup-section-header [title]="title"></popup-section-header>
    `,
  }),
  args: {
    title: "Only Title",
  },
};

export const TrailingText: Story = {
  render: (args) => ({
    props: args,
    template: `
      <popup-section-header [title]="title">
        <span bitTypography="body2" slot="end">13</span>
      </popup-section-header>
    `,
  }),
  args: {
    title: "Trailing Text",
  },
};

export const TailingIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <popup-section-header [title]="title">
        <button bitIconButton="bwi-star" size="small" slot="end"></button>
      </popup-section-header>
    `,
  }),
  args: {
    title: "Trailing Icon",
  },
};

export const TitleSuffix: Story = {
  render: (args) => ({
    props: args,
    template: `
      <popup-section-header [title]="title">
        <button bitIconButton="bwi-refresh" size="small" slot="title-suffix"></button>
      </popup-section-header>
    `,
  }),
  args: {
    title: "Title Suffix",
  },
};

export const WithSections: Story = {
  render: () => ({
    template: `
      <div class="tw-bg-background-alt tw-p-2">
        <bit-section>
          <popup-section-header title="Section 1">
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </popup-section-header>
          <bit-card>
            <h3 bitTypography="h3">Card 1 Content</h3>
          </bit-card>
        </bit-section>
        <bit-section>
          <popup-section-header title="Section 2">
            <button bitIconButton="bwi-star" size="small" slot="end"></button>
          </popup-section-header>
          <bit-card>
            <h3 bitTypography="h3">Card 2 Content</h3>
          </bit-card>
        </bit-section>
      </div>
    `,
  }),
};
