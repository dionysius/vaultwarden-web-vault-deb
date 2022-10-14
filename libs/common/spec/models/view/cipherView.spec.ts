import { CipherType } from "@bitwarden/common/enums/cipherType";
import { AttachmentView } from "@bitwarden/common/models/view/attachment.view";
import { CardView } from "@bitwarden/common/models/view/card.view";
import { CipherView } from "@bitwarden/common/models/view/cipher.view";
import { FieldView } from "@bitwarden/common/models/view/field.view";
import { IdentityView } from "@bitwarden/common/models/view/identity.view";
import { LoginView } from "@bitwarden/common/models/view/login.view";
import { PasswordHistoryView } from "@bitwarden/common/models/view/password-history.view";
import { SecureNoteView } from "@bitwarden/common/models/view/secure-note.view";

import { mockFromJson } from "../../utils";

jest.mock("@bitwarden/common/models/view/login.view");
jest.mock("@bitwarden/common/models/view/attachment.view");
jest.mock("@bitwarden/common/models/view/field.view");
jest.mock("@bitwarden/common/models/view/password-history.view");

describe("CipherView", () => {
  beforeEach(() => {
    (LoginView as any).mockClear();
    (AttachmentView as any).mockClear();
    (FieldView as any).mockClear();
    (PasswordHistoryView as any).mockClear();
  });

  describe("fromJSON", () => {
    it("initializes nested objects", () => {
      jest.spyOn(AttachmentView, "fromJSON").mockImplementation(mockFromJson);
      jest.spyOn(FieldView, "fromJSON").mockImplementation(mockFromJson);
      jest.spyOn(PasswordHistoryView, "fromJSON").mockImplementation(mockFromJson);

      const revisionDate = new Date("2022-08-04T01:06:40.441Z");
      const deletedDate = new Date("2022-09-04T01:06:40.441Z");
      const actual = CipherView.fromJSON({
        revisionDate: revisionDate.toISOString(),
        deletedDate: deletedDate.toISOString(),
        attachments: ["attachment1", "attachment2"] as any,
        fields: ["field1", "field2"] as any,
        passwordHistory: ["ph1", "ph2", "ph3"] as any,
      });

      const expected = {
        revisionDate: revisionDate,
        deletedDate: deletedDate,
        attachments: ["attachment1_fromJSON", "attachment2_fromJSON"],
        fields: ["field1_fromJSON", "field2_fromJSON"],
        passwordHistory: ["ph1_fromJSON", "ph2_fromJSON", "ph3_fromJSON"],
      };

      expect(actual).toMatchObject(expected);
    });

    test.each([
      // Test description, CipherType, expected output
      ["LoginView", CipherType.Login, { login: "myLogin_fromJSON" }],
      ["CardView", CipherType.Card, { card: "myCard_fromJSON" }],
      ["IdentityView", CipherType.Identity, { identity: "myIdentity_fromJSON" }],
      ["Secure Note", CipherType.SecureNote, { secureNote: "mySecureNote_fromJSON" }],
    ])("initializes %s", (description: string, cipherType: CipherType, expected: any) => {
      jest.spyOn(LoginView, "fromJSON").mockImplementation(mockFromJson);
      jest.spyOn(IdentityView, "fromJSON").mockImplementation(mockFromJson);
      jest.spyOn(CardView, "fromJSON").mockImplementation(mockFromJson);
      jest.spyOn(SecureNoteView, "fromJSON").mockImplementation(mockFromJson);

      const actual = CipherView.fromJSON({
        login: "myLogin",
        card: "myCard",
        identity: "myIdentity",
        secureNote: "mySecureNote",
        type: cipherType,
      } as any);

      expect(actual).toMatchObject(expected);
    });
  });
});
