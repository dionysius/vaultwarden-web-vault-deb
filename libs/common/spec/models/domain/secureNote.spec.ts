import { SecureNoteType } from "@bitwarden/common/enums/secureNoteType";
import { SecureNoteData } from "@bitwarden/common/models/data/secure-note.data";
import { SecureNote } from "@bitwarden/common/models/domain/secure-note";

describe("SecureNote", () => {
  let data: SecureNoteData;

  beforeEach(() => {
    data = {
      type: SecureNoteType.Generic,
    };
  });

  it("Convert from empty", () => {
    const data = new SecureNoteData();
    const secureNote = new SecureNote(data);

    expect(secureNote).toEqual({
      type: undefined,
    });
  });

  it("Convert", () => {
    const secureNote = new SecureNote(data);

    expect(secureNote).toEqual({
      type: 0,
    });
  });

  it("toSecureNoteData", () => {
    const secureNote = new SecureNote(data);
    expect(secureNote.toSecureNoteData()).toEqual(data);
  });

  it("Decrypt", async () => {
    const secureNote = new SecureNote();
    secureNote.type = SecureNoteType.Generic;

    const view = await secureNote.decrypt(null);

    expect(view).toEqual({
      type: 0,
    });
  });

  describe("fromJSON", () => {
    it("returns null if object is null", () => {
      expect(SecureNote.fromJSON(null)).toBeNull();
    });
  });
});
