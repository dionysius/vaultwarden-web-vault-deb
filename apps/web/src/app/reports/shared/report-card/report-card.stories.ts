import { RouterTestingModule } from "@angular/router/testing";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BadgeModule, IconModule } from "@bitwarden/components";

import { PremiumBadgeComponent } from "../../../../vault/app/components/premium-badge.component";
import { PreloadedEnglishI18nModule } from "../../../tests/preloaded-english-i18n.module";
import { ReportVariant } from "../models/report-variant";

import { ReportCardComponent } from "./report-card.component";

export default {
  title: "Web/Reports/Card",
  component: ReportCardComponent,
  decorators: [
    moduleMetadata({
      imports: [
        JslibModule,
        BadgeModule,
        IconModule,
        RouterTestingModule,
        PreloadedEnglishI18nModule,
      ],
      declarations: [PremiumBadgeComponent],
    }),
  ],
  args: {
    title: "Exposed Passwords",
    description:
      "Passwords exposed in a data breach are easy targets for attackers. Change these passwords to prevent potential break-ins.",
    icon: "reportExposedPasswords",
    variant: ReportVariant.Enabled,
  },
} as Meta;

const Template: Story<ReportCardComponent> = (args: ReportCardComponent) => ({
  props: args,
});

export const Enabled = Template.bind({});

export const RequiresPremium = Template.bind({});
RequiresPremium.args = {
  variant: ReportVariant.RequiresPremium,
};

export const RequiresUpgrade = Template.bind({});
RequiresUpgrade.args = {
  variant: ReportVariant.RequiresUpgrade,
};
