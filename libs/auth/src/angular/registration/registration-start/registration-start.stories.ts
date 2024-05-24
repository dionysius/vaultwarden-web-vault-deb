import { importProvidersFrom } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { of } from "rxjs";

import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { PreloadedEnglishI18nModule } from "../../../../../../apps/web/src/app/core/tests";

import { RegistrationStartComponent } from "./registration-start.component";

export default {
  title: "Auth/Registration/Registration Start",
  component: RegistrationStartComponent,
} as Meta;

const decorators = (options: { isSelfHost: boolean; queryParams: Params }) => {
  return [
    moduleMetadata({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of(options.queryParams) },
        },
        {
          provide: PlatformUtilsService,
          useValue: {
            isSelfHost: () => options.isSelfHost,
          } as Partial<PlatformUtilsService>,
        },
      ],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ];
};

type Story = StoryObj<RegistrationStartComponent>;

export const CloudExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({ isSelfHost: false, queryParams: {} }),
};

export const SelfHostExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({ isSelfHost: true, queryParams: {} }),
};

export const QueryParamsExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({
    isSelfHost: false,
    queryParams: { email: "jaredWasHere@bitwarden.com", emailReadonly: "true" },
  }),
};
