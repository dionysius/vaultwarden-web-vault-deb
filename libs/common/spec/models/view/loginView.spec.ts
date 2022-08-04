import { LoginUriView } from "@bitwarden/common/models/view/loginUriView";
import { LoginView } from "@bitwarden/common/models/view/loginView";

jest.mock("@bitwarden/common/models/view/loginUriView");

describe("LoginView", () => {
  beforeEach(() => {
    (LoginUriView as any).mockClear();
  });

  it("fromJSON initializes nested objects", () => {
    const mockFromJson = (stub: string) => stub + "_fromJSON";
    jest.spyOn(LoginUriView, "fromJSON").mockImplementation(mockFromJson as any);

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
