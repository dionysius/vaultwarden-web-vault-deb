import { Component, Directive, Input } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata } from "@storybook/angular";
import { BehaviorSubject } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { IconButtonModule, LinkModule, MenuModule } from "@bitwarden/components";
import { I18nMockService } from "@bitwarden/components/src/utils/i18n-mock.service";

import { ProductSwitcherContentComponent } from "./product-switcher-content.component";
import { ProductSwitcherComponent } from "./product-switcher.component";

@Directive({
  selector: "[mockOrgs]",
})
class MockOrganizationService implements Partial<OrganizationService> {
  private static _orgs = new BehaviorSubject<Organization[]>([]);
  organizations$ = MockOrganizationService._orgs; // eslint-disable-line rxjs/no-exposed-subjects

  @Input()
  set mockOrgs(orgs: Organization[]) {
    this.organizations$.next(orgs);
  }
}

@Component({
  selector: "story-layout",
  template: `<ng-content></ng-content>`,
})
class StoryLayoutComponent {}

@Component({
  selector: "story-content",
  template: ``,
})
class StoryContentComponent {}

export default {
  title: "Web/Product Switcher",
  decorators: [
    moduleMetadata({
      declarations: [
        ProductSwitcherContentComponent,
        ProductSwitcherComponent,
        MockOrganizationService,
        StoryLayoutComponent,
        StoryContentComponent,
      ],
      imports: [
        JslibModule,
        MenuModule,
        IconButtonModule,
        LinkModule,
        RouterModule.forRoot(
          [
            {
              path: "",
              component: StoryLayoutComponent,
              children: [
                {
                  path: "",
                  redirectTo: "vault",
                  pathMatch: "full",
                },
                {
                  path: "sm/:organizationId",
                  component: StoryContentComponent,
                },
                {
                  path: "vault",
                  component: StoryContentComponent,
                },
              ],
            },
          ],
          { useHash: true }
        ),
      ],
      providers: [
        { provide: OrganizationService, useClass: MockOrganizationService },
        MockOrganizationService,
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              moreFromBitwarden: "More from Bitwarden",
              switchProducts: "Switch Products",
            });
          },
        },
      ],
    }),
  ],
} as Meta;

const Template: Story = (args) => ({
  props: args,
  template: `
    <router-outlet [mockOrgs]="mockOrgs"></router-outlet>
    <div class="tw-flex tw-gap-[200px]">
      <div>
        <h1 class="tw-text-main tw-text-base tw-underline">Closed</h1>
        <product-switcher></product-switcher>
      </div>
      <div>
        <h1 class="tw-text-main tw-text-base tw-underline">Open</h1>
        <product-switcher-content #content></product-switcher-content>
        <div class="tw-h-40">
          <div class="cdk-overlay-pane bit-menu-panel">
            <ng-container *ngTemplateOutlet="content?.menu?.templateRef"></ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
});

export const NoOrgs = Template.bind({});
NoOrgs.args = {
  mockOrgs: [],
};

export const OrgWithoutSecretsManager = Template.bind({});
OrgWithoutSecretsManager.args = {
  mockOrgs: [{ id: "a" }],
};

export const OrgWithSecretsManager = Template.bind({});
OrgWithSecretsManager.args = {
  mockOrgs: [{ id: "b", canAccessSecretsManager: true }],
};
