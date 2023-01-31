import { mockFromJson } from "../../../../spec/utils";
import { SymmetricCryptoKey } from "../../../models/domain/symmetric-crypto-key";

import { AttachmentView } from "./attachment.view";

jest.mock("../../../models/domain/symmetric-crypto-key");

describe("AttachmentView", () => {
  it("fromJSON initializes nested objects", () => {
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson);

    const actual = AttachmentView.fromJSON({
      key: "encKeyB64" as any,
    });

    expect(actual.key).toEqual("encKeyB64_fromJSON");
  });
});
