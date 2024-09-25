import { Injectable } from "@angular/core";

import { CipherId } from "@bitwarden/common/types/guid";
import { DialogService } from "@bitwarden/components";

import { ViewPasswordHistoryService } from "../../../../../../libs/common/src/vault/abstractions/view-password-history.service";
import { openPasswordHistoryDialog } from "../individual-vault/password-history.component";

/**
 * This service is used to display the password history dialog in the web vault.
 */
@Injectable()
export class WebViewPasswordHistoryService implements ViewPasswordHistoryService {
  constructor(private dialogService: DialogService) {}

  /**
   * Opens the password history dialog for the given cipher ID.
   * @param cipherId The ID of the cipher to view the password history for.
   */
  async viewPasswordHistory(cipherId: CipherId) {
    openPasswordHistoryDialog(this.dialogService, { data: { cipherId } });
  }
}
