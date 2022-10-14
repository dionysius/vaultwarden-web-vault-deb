import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { StorageOptions } from "@bitwarden/common/models/domain/storage-options";
import { BadgeModule, I18nMockService } from "@bitwarden/components";

import { PremiumBadgeComponent } from "./premium-badge.component";

class MockMessagingService implements MessagingService {
  send(subscriber: string, arg?: any) {
    alert("Clicked on badge");
  }
}

class MockedStateService implements Partial<StateService> {
  async getCanAccessPremium(options?: StorageOptions) {
    return false;
  }
}

export default {
  title: "Web/Premium Badge",
  component: PremiumBadgeComponent,
  decorators: [
    moduleMetadata({
      imports: [JslibModule, BadgeModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              premium: "Premium",
            });
          },
        },
        {
          provide: MessagingService,
          useFactory: () => {
            return new MockMessagingService();
          },
        },
        {
          provide: StateService,
          useFactory: () => {
            return new MockedStateService();
          },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<PremiumBadgeComponent> = (args: PremiumBadgeComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
Primary.args = {};
