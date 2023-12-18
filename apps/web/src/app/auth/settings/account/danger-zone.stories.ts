import { importProvidersFrom } from "@angular/core";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule } from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../core/tests";

import { DangerZoneComponent } from "./danger-zone.component";

export default {
  title: "Web/Danger Zone",
  component: DangerZoneComponent,
  decorators: [
    moduleMetadata({
      imports: [ButtonModule, JslibModule],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ],
} as Meta;

type Story = StoryObj<DangerZoneComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-danger-zone>
        <button type="button" bitButton buttonType="danger">Danger A</button>
        <button type="button" bitButton buttonType="danger">Danger B</button>
      </app-danger-zone>
      `,
  }),
};
