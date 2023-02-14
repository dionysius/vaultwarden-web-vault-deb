import { Component, Injectable } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata, componentWrapperDecorator } from "@storybook/angular";
import { Observable } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import {
  BreadcrumbsModule,
  ButtonModule,
  NavigationModule,
  IconModule,
  IconButtonModule,
  TabsModule,
} from "@bitwarden/components";
import { InputModule } from "@bitwarden/components/src/input/input.module";
import { PreloadedEnglishI18nModule } from "@bitwarden/web-vault/app/tests/preloaded-english-i18n.module";

import { HeaderComponent } from "./header.component";

@Injectable()
class MockStateService {
  activeAccount$ = new Observable();
  accounts$ = new Observable();
}

@Component({
  selector: "product-switcher",
  template: `<button bitIconButton="bwi-filter"></button>`,
})
class MockProductSwitcher {}

export default {
  title: "Web/Header",
  component: HeaderComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `<div class="tw-min-h-screen tw-flex-1 tw-p-6 tw-text-main">${story}</div>`
    ),
    moduleMetadata({
      imports: [
        JslibModule,
        RouterModule.forRoot(
          [
            {
              path: "",
              component: HeaderComponent,
            },
          ],
          { useHash: true }
        ),
        BreadcrumbsModule,
        ButtonModule,
        InputModule,
        IconModule,
        IconButtonModule,
        NavigationModule,
        PreloadedEnglishI18nModule,
        TabsModule,
      ],
      declarations: [HeaderComponent, MockProductSwitcher],
      providers: [{ provide: StateService, useClass: MockStateService }],
    }),
  ],
} as Meta;

export const KitchenSink: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="LongTitleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" icon="bwi-bug">
      <bit-breadcrumbs slot="breadcrumbs">
        <bit-breadcrumb>Foo</bit-breadcrumb>
        <bit-breadcrumb>Bar</bit-breadcrumb>
      </bit-breadcrumbs>
      <input
        bitInput
        placeholder="Ask Jeeves"
        type="text"
      />
      <button bitButton buttonType="primary">New</button>
      <button bitButton slot="secondary">Click Me 🎉</button>
      <bit-tab-nav-bar slot="tabs">
        <bit-tab-link route="">Foo</bit-tab-link>
        <bit-tab-link route="#bar">Bar</bit-tab-link>
      </bit-tab-nav-bar>
    </sm-header>
  `,
});

export const Basic: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug"></sm-header>
  `,
});

export const WithLongTitle: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="LongTitleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" icon="bwi-bug"></sm-header>
  `,
});

export const WithBreadcrumbs: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug" class="tw-text-main">
      <bit-breadcrumbs slot="breadcrumbs">
        <bit-breadcrumb>Foo</bit-breadcrumb>
        <bit-breadcrumb>Bar</bit-breadcrumb>
      </bit-breadcrumbs>
    </sm-header>
  `,
});

export const WithSearch: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug" class="tw-text-main">
      <input
        bitInput
        placeholder="Ask Jeeves"
        type="text"
      />
    </sm-header>
  `,
});

export const WithSecondaryContent: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug" class="tw-text-main">
      <button bitButton slot="secondary">Click Me 🎉</button>
    </sm-header>
  `,
});

export const WithTabs: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug" class="tw-text-main">
      <bit-tab-nav-bar slot="tabs">
        <bit-tab-link route="">Foo</bit-tab-link>
        <bit-tab-link route="#bar">Bar</bit-tab-link>
      </bit-tab-nav-bar>
    </sm-header>
  `,
});

export const WithCustomTitleComponent: Story = (args) => ({
  props: args,
  template: `
    <sm-header title="Foobar" icon="bwi-bug" class="tw-text-main">
      <h1 slot="title" class="tw-text-3xl tw-font-semibold" style="font-family: 'Comic Sans MS'">Bitwarden</h1>
    </sm-header>
  `,
});
