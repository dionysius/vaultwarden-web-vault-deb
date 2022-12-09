import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { NavigationModule, IconModule } from "@bitwarden/components";
import { PreloadedEnglishI18nModule } from "@bitwarden/web-vault/app/tests/preloaded-english-i18n.module";

import { LayoutComponent } from "./layout.component";
import { NavigationComponent } from "./navigation.component";

@Component({
  selector: "story-content",
  template: ` <p class="tw-text-main">Content</p> `,
})
class StoryContentComponent {}

export default {
  title: "Web/Layout",
  component: LayoutComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot(
          [
            {
              path: "",
              component: LayoutComponent,
              children: [
                {
                  path: "",
                  redirectTo: "secrets",
                  pathMatch: "full",
                },
                {
                  path: "secrets",
                  component: StoryContentComponent,
                  data: {
                    title: "secrets",
                    searchTitle: "searchSecrets",
                  },
                },
                {
                  outlet: "sidebar",
                  path: "",
                  component: NavigationComponent,
                },
              ],
            },
          ],
          { useHash: true }
        ),
        IconModule,
        NavigationModule,
        PreloadedEnglishI18nModule,
      ],
      declarations: [LayoutComponent, NavigationComponent, StoryContentComponent],
    }),
  ],
} as Meta;

const Template: Story = (args) => ({
  props: args,
  template: `
    <router-outlet></router-outlet>
  `,
});

export const Default = Template.bind({});
