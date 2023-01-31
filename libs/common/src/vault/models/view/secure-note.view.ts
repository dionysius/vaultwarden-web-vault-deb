import { Jsonify } from "type-fest";

import { SecureNoteType } from "../../../enums/secureNoteType";
import { SecureNote } from "../domain/secure-note";

import { ItemView } from "./item.view";

export class SecureNoteView extends ItemView {
  type: SecureNoteType = null;

  constructor(n?: SecureNote) {
    super();
    if (!n) {
      return;
    }

    this.type = n.type;
  }

  get subTitle(): string {
    return null;
  }

  static fromJSON(obj: Partial<Jsonify<SecureNoteView>>): SecureNoteView {
    return Object.assign(new SecureNoteView(), obj);
  }
}
