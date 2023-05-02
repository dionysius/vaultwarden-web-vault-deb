import { ipcRenderer } from "electron";

import {
  DialogService,
  SimpleDialogOptions,
  SimpleDialogType,
} from "@bitwarden/angular/services/dialog";

// Electron supports a limited set of dialog types
// https://www.electronjs.org/docs/latest/api/dialog#dialogshowmessageboxbrowserwindow-options
const electronTypeMap: Record<SimpleDialogType, string> = {
  [SimpleDialogType.PRIMARY]: "info",
  [SimpleDialogType.SUCCESS]: "info",
  [SimpleDialogType.INFO]: "info",
  [SimpleDialogType.WARNING]: "warning",
  [SimpleDialogType.DANGER]: "error",
};

export class ElectronDialogService extends DialogService {
  async openSimpleDialog(options: SimpleDialogOptions) {
    const defaultCancel =
      options.cancelButtonText === undefined
        ? options.acceptButtonText == null
          ? "no"
          : "cancel"
        : null;

    return this.legacyShowDialog(
      this.translate(options.content),
      this.translate(options.title),
      this.translate(options.acceptButtonText, "yes"),
      this.translate(options.cancelButtonText, defaultCancel),
      options.type
    );
  }

  private async legacyShowDialog(
    body: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: SimpleDialogType
  ) {
    const buttons = [confirmText == null ? this.i18nService.t("ok") : confirmText];
    if (cancelText != null) {
      buttons.push(cancelText);
    }

    const result = await ipcRenderer.invoke("showMessageBox", {
      type: electronTypeMap[type] ?? "none",
      title: title,
      message: title,
      detail: body,
      buttons: buttons,
      cancelId: buttons.length === 2 ? 1 : null,
      defaultId: 0,
      noLink: true,
    });

    return Promise.resolve(result.response === 0);
  }
}
