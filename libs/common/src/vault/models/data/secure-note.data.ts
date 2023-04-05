import { SecureNoteType } from "../../../enums";
import { SecureNoteApi } from "../../../models/api/secure-note.api";

export class SecureNoteData {
  type: SecureNoteType;

  constructor(data?: SecureNoteApi) {
    if (data == null) {
      return;
    }

    this.type = data.type;
  }
}
