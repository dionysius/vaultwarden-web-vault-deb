import {
  DialogRef,
  DialogConfig,
  Dialog,
  DEFAULT_DIALOG_CONFIG,
  DIALOG_SCROLL_STRATEGY,
} from "@angular/cdk/dialog";
import { Overlay, OverlayContainer } from "@angular/cdk/overlay";
import { ComponentType } from "@angular/cdk/portal";
import { Inject, Injectable, Injector, Optional, SkipSelf, TemplateRef } from "@angular/core";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { DialogServiceAbstraction } from "./dialog.service.abstraction";
import { SimpleDialogOptions } from "./simple-dialog-options";
import { Translation } from "./translation";

// This is a temporary base class for Dialogs. It is intended to be removed once the Component Library is adopted by each app.
@Injectable()
export abstract class DialogService extends Dialog implements DialogServiceAbstraction {
  constructor(
    /** Parent class constructor */
    _overlay: Overlay,
    _injector: Injector,
    @Optional() @Inject(DEFAULT_DIALOG_CONFIG) _defaultOptions: DialogConfig,
    @Optional() @SkipSelf() _parentDialog: Dialog,
    _overlayContainer: OverlayContainer,
    @Inject(DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
    protected i18nService: I18nService
  ) {
    super(_overlay, _injector, _defaultOptions, _parentDialog, _overlayContainer, scrollStrategy);
  }

  async openSimpleDialog(options: SimpleDialogOptions): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  openSimpleDialogRef(simpleDialogOptions: SimpleDialogOptions): DialogRef {
    throw new Error("Method not implemented.");
  }

  override open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config?: DialogConfig<D, DialogRef<R, C>>
  ): DialogRef<R, C> {
    throw new Error("Method not implemented.");
  }

  protected translate(translation: string | Translation, defaultKey?: string): string {
    if (translation == null && defaultKey == null) {
      return null;
    }

    if (translation == null) {
      return this.i18nService.t(defaultKey);
    }

    // Translation interface use implies we must localize.
    if (typeof translation === "object") {
      return this.i18nService.t(translation.key, ...(translation.placeholders ?? []));
    }

    return translation;
  }
}
