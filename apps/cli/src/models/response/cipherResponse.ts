import { CipherType } from "@bitwarden/common/enums/cipherType";
import { CipherWithIdExport } from "@bitwarden/common/models/export/cipherWithIdsExport";
import { CipherView } from "@bitwarden/common/models/view/cipherView";
import { BaseResponse } from "@bitwarden/node/cli/models/response/baseResponse";

import { AttachmentResponse } from "./attachmentResponse";
import { LoginResponse } from "./loginResponse";
import { PasswordHistoryResponse } from "./passwordHistoryResponse";

export class CipherResponse extends CipherWithIdExport implements BaseResponse {
  object: string;
  attachments: AttachmentResponse[];
  revisionDate: Date;
  creationDate: Date;
  deletedDate: Date;
  passwordHistory: PasswordHistoryResponse[];

  constructor(o: CipherView) {
    super();
    this.object = "item";
    this.build(o);
    if (o.attachments != null) {
      this.attachments = o.attachments.map((a) => new AttachmentResponse(a));
    }
    this.revisionDate = o.revisionDate;
    if (o.creationDate != null) {
      this.creationDate = o.creationDate;
    }
    this.deletedDate = o.deletedDate;
    if (o.passwordHistory != null) {
      this.passwordHistory = o.passwordHistory.map((h) => new PasswordHistoryResponse(h));
    }
    if (o.type === CipherType.Login && o.login != null) {
      this.login = new LoginResponse(o.login);
    }
  }
}
