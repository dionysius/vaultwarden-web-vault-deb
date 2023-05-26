import { importProvidersFrom } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, applicationConfig, moduleMetadata } from "@storybook/angular";
import { delay, of, startWith } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { LinkModule, IconModule, ProgressModule } from "@bitwarden/components";
import { PreloadedEnglishI18nModule } from "@bitwarden/web-vault/app/tests/preloaded-english-i18n.module";

import { OnboardingTaskComponent } from "./onboarding-task.component";
import { OnboardingComponent } from "./onboarding.component";

export default {
  title: "Web/Onboarding",
  component: OnboardingComponent,
  decorators: [
    moduleMetadata({
      imports: [JslibModule, RouterModule, LinkModule, IconModule, ProgressModule],
      declarations: [OnboardingTaskComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(RouterModule.forRoot([], { useHash: true })),
        importProvidersFrom(PreloadedEnglishI18nModule),
      ],
    }),
  ],
} as Meta;

const Template: Story = (args) => ({
  props: {
    createServiceAccount: false,
    importSecrets$: of(false),
    createSecret: false,
    createProject: false,
    ...args,
  },
  template: `
    <sm-onboarding title="Get started">
      <sm-onboarding-task
        [title]="'createServiceAccount' | i18n"
        icon="bwi-cli"
        [completed]="createServiceAccount"
      >
        <span>
          {{ "downloadThe" | i18n }} <a bitLink routerLink="">{{ "smCLI" | i18n }}</a>
        </span>
      </sm-onboarding-task>
      <sm-onboarding-task
        [title]="'createProject' | i18n"
        icon="bwi-collection"
        [completed]="createProject"
      ></sm-onboarding-task>
      <sm-onboarding-task
        [title]="'importSecrets' | i18n"
        icon="bwi-download"
        [completed]="importSecrets$ | async"
      ></sm-onboarding-task>
      <sm-onboarding-task
        [title]="'createSecret' | i18n"
        icon="bwi-key"
        [completed]="createSecret"
      ></sm-onboarding-task>
    </sm-onboarding>
  `,
});

export const Empty = Template.bind({});

export const Partial = Template.bind({});
Partial.args = {
  ...Template.args,
  createServiceAccount: true,
  createProject: true,
};

export const Full = Template.bind({});
Full.args = {
  ...Template.args,
  createServiceAccount: true,
  createProject: true,
  createSecret: true,
  importSecrets$: of(true).pipe(delay(0), startWith(false)),
};
