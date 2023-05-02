import { Dialog, DialogRef } from "@angular/cdk/dialog";

import { SimpleDialogOptions } from "./simple-dialog-options";

export abstract class DialogServiceAbstraction extends Dialog {
  /**
   * Opens a simple dialog, returns true if the user accepted the dialog.
   *
   * @param {SimpleDialogOptions} simpleDialogOptions - An object containing options for the dialog.
   * @returns `boolean` - True if the user accepted the dialog, false otherwise.
   */
  openSimpleDialog: (simpleDialogOptions: SimpleDialogOptions) => Promise<boolean>;

  /**
   * Opens a simple dialog.
   *
   * @deprecated Use `openSimpleDialogAcceptedPromise` instead. If you find a use case for the `dialogRef`
   * please let #wg-component-library know and we can un-deprecate this method.
   *
   * @param {SimpleDialogOptions} simpleDialogOptions - An object containing options for the dialog.
   * @returns `DialogRef` - The reference to the opened dialog.
   * Contains a closed observable which can be subscribed to for determining which button
   * a user pressed (see `SimpleDialogCloseType`)
   */
  openSimpleDialogRef: (simpleDialogOptions: SimpleDialogOptions) => DialogRef;
}
