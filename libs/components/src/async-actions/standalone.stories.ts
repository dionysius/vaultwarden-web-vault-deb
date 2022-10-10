import { Component } from "@angular/core";
import { action } from "@storybook/addon-actions";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { delay, of } from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";

import { BitActionDirective } from "./bit-action.directive";

const template = `
  <button bitButton buttonType="primary" [bitAction]="action" class="tw-mr-2">
    Perform action
  </button>
  <button bitIconButton="bwi-trash" buttonType="danger" [bitAction]="action"></button>`;

@Component({
  template,
  selector: "app-promise-example",
})
class PromiseExampleComponent {
  action = async () => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(resolve, 2000);
    });
  };
}

@Component({
  template,
  selector: "app-observable-example",
})
class ObservableExampleComponent {
  action = () => {
    return of("fake observable").pipe(delay(2000));
  };
}

@Component({
  template,
  selector: "app-rejected-promise-example",
})
class RejectedPromiseExampleComponent {
  action = async () => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => reject(new Error("Simulated error")), 2000);
    });
  };
}

export default {
  title: "Component Library/Async Actions/Standalone",
  decorators: [
    moduleMetadata({
      declarations: [
        BitActionDirective,
        PromiseExampleComponent,
        ObservableExampleComponent,
        RejectedPromiseExampleComponent,
      ],
      imports: [ButtonModule, IconButtonModule],
      providers: [
        {
          provide: ValidationService,
          useValue: {
            showError: action("ValidationService.showError"),
          } as Partial<ValidationService>,
        },
      ],
    }),
  ],
} as Meta;

const PromiseTemplate: Story<PromiseExampleComponent> = (args: PromiseExampleComponent) => ({
  props: args,
  template: `<app-promise-example></app-promise-example>`,
});

export const UsingPromise = PromiseTemplate.bind({});

const ObservableTemplate: Story<ObservableExampleComponent> = (
  args: ObservableExampleComponent
) => ({
  template: `<app-observable-example></app-observable-example>`,
});

export const UsingObservable = ObservableTemplate.bind({});

const RejectedPromiseTemplate: Story<ObservableExampleComponent> = (
  args: ObservableExampleComponent
) => ({
  template: `<app-rejected-promise-example></app-rejected-promise-example>`,
});

export const RejectedPromise = RejectedPromiseTemplate.bind({});
