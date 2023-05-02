import { Injectable } from "@angular/core";
import Swal, { SweetAlertIcon } from "sweetalert2";

import {
  DialogService,
  SimpleDialogOptions,
  SimpleDialogType,
} from "@bitwarden/angular/services/dialog";

@Injectable()
export class BrowserDialogService extends DialogService {
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
    let iconClasses: string = null;
    let icon: SweetAlertIcon = null;
    if (type != null) {
      // If you add custom types to this part, the type to SweetAlertIcon cast below needs to be changed.
      switch (type) {
        case "success":
          iconClasses = "bwi-check text-success";
          icon = "success";
          break;
        case "warning":
          iconClasses = "bwi-exclamation-triangle text-warning";
          icon = "warning";
          break;
        case "danger":
          iconClasses = "bwi-error text-danger";
          icon = "error";
          break;
        case "info":
          iconClasses = "bwi-info-circle text-info";
          icon = "info";
          break;
        default:
          break;
      }
    }

    const confirmed = await Swal.fire({
      heightAuto: false,
      buttonsStyling: false,
      icon: icon,
      iconHtml:
        iconClasses != null ? `<i class="swal-custom-icon bwi ${iconClasses}"></i>` : undefined,
      text: body,
      titleText: title,
      showCancelButton: cancelText != null,
      cancelButtonText: cancelText,
      showConfirmButton: true,
      confirmButtonText: confirmText == null ? this.i18nService.t("ok") : confirmText,
      timer: 300000,
    });

    return confirmed.value;
  }
}
