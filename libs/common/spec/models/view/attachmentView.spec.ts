import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
import { AttachmentView } from "@bitwarden/common/models/view/attachmentView";

jest.mock("@bitwarden/common/models/domain/symmetricCryptoKey");

describe("AttachmentView", () => {
  it("fromJSON initializes nested objects", () => {
    const mockFromJson = (stub: string) => stub + "_fromJSON";
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson as any);

    const actual = AttachmentView.fromJSON({
      key: "encKeyB64" as any,
    });

    expect(actual.key).toEqual("encKeyB64_fromJSON");
  });
});
