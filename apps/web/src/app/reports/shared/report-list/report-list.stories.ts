import { RouterTestingModule } from "@angular/router/testing";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { BadgeModule, IconModule } from "@bitwarden/components";

import { PremiumBadgeComponent } from "../../../../vault/app/components/premium-badge.component";
import { PreloadedEnglishI18nModule } from "../../../tests/preloaded-english-i18n.module";
import { reports } from "../../reports";
import { ReportVariant } from "../models/report-variant";
import { ReportCardComponent } from "../report-card/report-card.component";

import { ReportListComponent } from "./report-list.component";

export default {
  title: "Web/Reports/List",
  component: ReportListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        JslibModule,
        BadgeModule,
        RouterTestingModule,
        PreloadedEnglishI18nModule,
        IconModule,
      ],
      declarations: [PremiumBadgeComponent, ReportCardComponent],
    }),
  ],
  args: {
    reports: Object.values(reports).map((report) => ({
      ...report,
      variant:
        report.route == "breach-report" ? ReportVariant.Enabled : ReportVariant.RequiresPremium,
    })),
  },
} as Meta;

const Template: Story<ReportListComponent> = (args: ReportListComponent) => ({
  props: args,
});

export const Default = Template.bind({});
