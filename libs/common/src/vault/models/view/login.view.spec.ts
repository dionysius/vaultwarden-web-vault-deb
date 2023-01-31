import { mockFromJson } from "../../../../spec/utils";

import { LoginUriView } from "./login-uri.view";
import { LoginView } from "./login.view";

jest.mock("../../models/view/login-uri.view");

describe("LoginView", () => {
  beforeEach(() => {
    (LoginUriView as any).mockClear();
  });

  it("fromJSON initializes nested objects", () => {
    jest.spyOn(LoginUriView, "fromJSON").mockImplementation(mockFromJson);

    const passwordRevisionDate = new Date();

    const actual = LoginView.fromJSON({
      passwordRevisionDate: passwordRevisionDate.toISOString(),
      uris: ["uri1", "uri2", "uri3"] as any,
    });

    expect(actual).toMatchObject({
      passwordRevisionDate: passwordRevisionDate,
      uris: ["uri1_fromJSON", "uri2_fromJSON", "uri3_fromJSON"],
    });
  });
});
