import { mockFromJson } from "../../../../spec";
import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";

import { AttachmentView } from "./attachment.view";

jest.mock("../../../platform/models/domain/symmetric-crypto-key");

describe("AttachmentView", () => {
  it("fromJSON initializes nested objects", () => {
    jest.spyOn(SymmetricCryptoKey, "fromJSON").mockImplementation(mockFromJson);

    const actual = AttachmentView.fromJSON({
      key: "encKeyB64" as any,
    });

    expect(actual.key).toEqual("encKeyB64_fromJSON");
  });
});
