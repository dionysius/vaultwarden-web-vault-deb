import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SimpleDialogCloseType } from "./models/simple-dialog-close-type.enum";
import { SimpleDialogOptions } from "./models/simple-dialog-options";
import { SimpleDialogType } from "./models/simple-dialog-type.enum";
import { Translation } from "./models/translation";

const DEFAULT_ICON: Record<SimpleDialogType, string> = {
  [SimpleDialogType.PRIMARY]: "bwi-business",
  [SimpleDialogType.SUCCESS]: "bwi-star",
  [SimpleDialogType.INFO]: "bwi-info-circle",
  [SimpleDialogType.WARNING]: "bwi-exclamation-triangle",
  [SimpleDialogType.DANGER]: "bwi-error",
};

const DEFAULT_COLOR: Record<SimpleDialogType, string> = {
  [SimpleDialogType.PRIMARY]: "tw-text-primary-500",
  [SimpleDialogType.SUCCESS]: "tw-text-success",
  [SimpleDialogType.INFO]: "tw-text-info",
  [SimpleDialogType.WARNING]: "tw-text-warning",
  [SimpleDialogType.DANGER]: "tw-text-danger",
};

@Component({
  selector: "bit-simple-configurable-dialog",
  templateUrl: "./simple-configurable-dialog.component.html",
})
export class SimpleConfigurableDialogComponent {
  SimpleDialogType = SimpleDialogType;
  SimpleDialogCloseType = SimpleDialogCloseType;

  get iconClasses() {
    return [
      this.simpleDialogOpts.icon ?? DEFAULT_ICON[this.simpleDialogOpts.type],
      DEFAULT_COLOR[this.simpleDialogOpts.type],
    ];
  }

  title: string;
  content: string;
  acceptButtonText: string;
  cancelButtonText: string;

  showCancelButton = this.simpleDialogOpts.cancelButtonText !== null;

  constructor(
    public dialogRef: DialogRef,
    private i18nService: I18nService,
    @Inject(DIALOG_DATA) public simpleDialogOpts?: SimpleDialogOptions
  ) {
    this.localizeText();
  }

  private localizeText() {
    this.title = this.translate(this.simpleDialogOpts.title);
    this.content = this.translate(this.simpleDialogOpts.content);
    this.acceptButtonText = this.translate(this.simpleDialogOpts.acceptButtonText, "yes");

    if (this.showCancelButton) {
      // If accept text is overridden, use cancel, otherwise no
      this.cancelButtonText = this.translate(
        this.simpleDialogOpts.cancelButtonText,
        this.simpleDialogOpts.acceptButtonText !== undefined ? "cancel" : "no"
      );
    }
  }

  private translate(translation: string | Translation, defaultKey?: string): string {
    // Translation interface use implies we must localize.
    if (typeof translation === "object") {
      return this.i18nService.t(translation.key, ...translation.placeholders);
    }

    // Use string that is already translated or use default key post translate
    return translation ?? this.i18nService.t(defaultKey);
  }
}
