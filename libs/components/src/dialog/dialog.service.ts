import { Dialog, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { ComponentType } from "@angular/cdk/overlay";
import { Injectable, TemplateRef } from "@angular/core";

@Injectable()
export class DialogService extends Dialog {
  override open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    config = {
      backdropClass: ["tw-fixed", "tw-bg-black", "tw-bg-opacity-30", "tw-inset-0", "tw-z-40"],
      ...config,
    };

    return super.open(componentOrTemplateRef, config);
  }
}
