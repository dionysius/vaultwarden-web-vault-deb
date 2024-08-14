import { importProvidersFrom } from "@angular/core";
import { action } from "@storybook/addon-actions";
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from "@storybook/angular";

import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { Send } from "@bitwarden/common/tools/send/models/domain/send";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import { AsyncActionsModule, ButtonModule, ToastService } from "@bitwarden/components";
import { SendFormConfig } from "@bitwarden/send-ui";
// FIXME: remove `/apps` import from `/libs`
// eslint-disable-next-line import/no-restricted-paths
import { PreloadedEnglishI18nModule } from "@bitwarden/web-vault/src/app/core/tests";

import { SendFormService } from "./abstractions/send-form.service";
import { SendFormComponent } from "./components/send-form.component";
import { SendFormModule } from "./send-form.module";

const defaultConfig: SendFormConfig = {
  mode: "add",
  sendType: SendType.Text,
  areSendsAllowed: true,
  originalSend: {
    id: "123",
    name: "Test Send",
    notes: "Example notes",
  } as unknown as Send,
};

class TestAddEditFormService implements SendFormService {
  decryptSend(): Promise<SendView> {
    return Promise.resolve(defaultConfig.originalSend as any);
  }
  async saveSend(send: SendView, file: File | ArrayBuffer): Promise<SendView> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return send;
  }
}

const actionsData = {
  onSave: action("onSave"),
};

export default {
  title: "Tools/Send Form",
  component: SendFormComponent,
  decorators: [
    moduleMetadata({
      imports: [SendFormModule, AsyncActionsModule, ButtonModule],
      providers: [
        {
          provide: SendFormService,
          useClass: TestAddEditFormService,
        },
        {
          provide: ToastService,
          useValue: {
            showToast: action("showToast"),
          },
        },
      ],
    }),
    componentWrapperDecorator(
      (story) => `<div class="tw-bg-background-alt tw-text-main tw-border">${story}</div>`,
    ),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ],
  args: {
    config: defaultConfig,
  },
  argTypes: {
    config: {
      description: "The configuration object for the form.",
    },
  },
} as Meta;

type Story = StoryObj<SendFormComponent>;

export const Default: Story = {
  render: (args) => {
    return {
      props: {
        onSave: actionsData.onSave,
        ...args,
      },
      template: /*html*/ `
        <tools-send-form [config]="config" (cipherSaved)="onSave($event)" formId="test-form" [submitBtn]="submitBtn"></tools-send-form>
        <button type="submit" form="test-form" bitButton buttonType="primary" #submitBtn>Submit</button>
      `,
    };
  },
};

export const Edit: Story = {
  ...Default,
  args: {
    config: {
      ...defaultConfig,
      mode: "edit",
      originalSend: defaultConfig.originalSend,
    },
  },
};

export const PartialEdit: Story = {
  ...Default,
  args: {
    config: {
      ...defaultConfig,
      mode: "partial-edit",
      originalSend: defaultConfig.originalSend,
    },
  },
};

export const SendsHaveBeenDisabledByPolicy: Story = {
  ...Default,
  args: {
    config: {
      ...defaultConfig,
      mode: "add",
      areSendsAllowed: false,
      originalSend: defaultConfig.originalSend,
    },
  },
};
