import { Jsonify } from "type-fest";

import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
import { LoginUriData } from "@bitwarden/common/models/data/login-uri.data";
import { EncString } from "@bitwarden/common/models/domain/enc-string";
import { LoginUri } from "@bitwarden/common/models/domain/login-uri";

import { mockEnc, mockFromJson } from "../../utils";

describe("LoginUri", () => {
  let data: LoginUriData;

  beforeEach(() => {
    data = {
      uri: "encUri",
      match: UriMatchType.Domain,
    };
  });

  it("Convert from empty", () => {
    const data = new LoginUriData();
    const loginUri = new LoginUri(data);

    expect(loginUri).toEqual({
      match: null,
      uri: null,
    });
  });

  it("Convert", () => {
    const loginUri = new LoginUri(data);

    expect(loginUri).toEqual({
      match: 0,
      uri: { encryptedString: "encUri", encryptionType: 0 },
    });
  });

  it("toLoginUriData", () => {
    const loginUri = new LoginUri(data);
    expect(loginUri.toLoginUriData()).toEqual(data);
  });

  it("Decrypt", async () => {
    const loginUri = new LoginUri();
    loginUri.match = UriMatchType.Exact;
    loginUri.uri = mockEnc("uri");

    const view = await loginUri.decrypt(null);

    expect(view).toEqual({
      _canLaunch: null,
      _domain: null,
      _host: null,
      _hostname: null,
      _uri: "uri",
      match: 3,
    });
  });

  describe("fromJSON", () => {
    it("initializes nested objects", () => {
      jest.spyOn(EncString, "fromJSON").mockImplementation(mockFromJson);

      const actual = LoginUri.fromJSON({
        uri: "myUri",
      } as Jsonify<LoginUri>);

      expect(actual).toEqual({
        uri: "myUri_fromJSON",
      });
      expect(actual).toBeInstanceOf(LoginUri);
    });

    it("returns null if object is null", () => {
      expect(LoginUri.fromJSON(null)).toBeNull();
    });
  });
});
