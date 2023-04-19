import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { InputModule } from "../input/input.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { SearchComponent } from "./search.component";

export default {
  title: "Component Library/Form/Search",
  component: SearchComponent,
  decorators: [
    moduleMetadata({
      imports: [InputModule, FormsModule, ReactiveFormsModule, JslibModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              search: "Search",
            });
          },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<SearchComponent> = (args: SearchComponent) => ({
  props: args,
  template: `
    <bit-search [(ngModel)]="searchText" [placeholder]="placeholder" [disabled]="disabled"></bit-search>
  `,
});

export const Default = Template.bind({});
Default.args = {};
