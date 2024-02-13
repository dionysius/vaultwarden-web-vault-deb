import { ProviderUserStatusType, ProviderUserType } from "../enums";
import { ProviderData } from "../models/data/provider.data";

import { PROVIDERS } from "./provider.service";

describe("PROVIDERS key definition", () => {
  const sut = PROVIDERS;
  it("should deserialize to a proper ProviderData object", async () => {
    const expectedResult: Record<string, ProviderData> = {
      "1": {
        id: "string",
        name: "string",
        status: ProviderUserStatusType.Accepted,
        type: ProviderUserType.ServiceUser,
        enabled: true,
        userId: "string",
        useEvents: true,
      },
    };
    const result = sut.deserializer(JSON.parse(JSON.stringify(expectedResult)));
    expect(result).toEqual(expectedResult);
  });
});
