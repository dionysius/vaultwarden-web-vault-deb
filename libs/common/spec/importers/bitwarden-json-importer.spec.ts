// eslint-disable-next-line no-restricted-imports
import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { BitwardenJsonImporter } from "@bitwarden/common/importers/bitwarden-json-importer";

import { data as passwordProtectedData } from "./test-data/bitwarden-json/password-protected.json";

describe("bitwarden json importer", () => {
  let sut: BitwardenJsonImporter;
  let cryptoService: SubstituteOf<CryptoService>;
  let i18nService: SubstituteOf<I18nService>;

  beforeEach(() => {
    cryptoService = Substitute.for<CryptoService>();
    i18nService = Substitute.for<I18nService>();

    sut = new BitwardenJsonImporter(cryptoService, i18nService);
  });

  it("should fail if password is needed", async () => {
    expect((await sut.parse(passwordProtectedData)).success).toBe(false);
  });

  it("should return password needed error message", async () => {
    const expected = "Password required error message";
    i18nService.t("importPasswordRequired").returns(expected);

    expect((await sut.parse(passwordProtectedData)).errorMessage).toEqual(expected);
  });
});
