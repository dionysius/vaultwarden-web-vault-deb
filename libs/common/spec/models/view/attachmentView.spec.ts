import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { AttachmentView } from "@bitwarden/common/models/view/attachment.view";

import { mockFromJson } from "../../utils";

jest.mock("@bitwarden/common/models/domain/symmetric-crypto-key");

describe("AttachmentView", () => {
  it("fromJSON initializes nested objects", () => {
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson);

    const actual = AttachmentView.fromJSON({
      key: "encKeyB64" as any,
    });

    expect(actual.key).toEqual("encKeyB64_fromJSON");
  });
});
