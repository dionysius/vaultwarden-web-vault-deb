import { firstValueFrom } from "rxjs";

import { UserId } from "@bitwarden/common/types/guid";

import { Forwarders, DefaultFirefoxRelayOptions } from "../../data";
import { FIREFOX_RELAY_FORWARDER } from "../storage";

import { FirefoxRelayForwarder } from "./firefox-relay";
import { mockApiService, mockI18nService } from "./mocks.jest";

const SomeUser = "some user" as UserId;

describe("Firefox Relay Forwarder", () => {
  it("key returns the Firefox Relay forwarder key", () => {
    const forwarder = new FirefoxRelayForwarder(null, null, null, null, null);

    expect(forwarder.key).toBe(FIREFOX_RELAY_FORWARDER);
  });

  describe("defaults$", () => {
    it("should return the default subaddress options", async () => {
      const strategy = new FirefoxRelayForwarder(null, null, null, null, null);

      const result = await firstValueFrom(strategy.defaults$(SomeUser));

      expect(result).toEqual(DefaultFirefoxRelayOptions);
    });
  });

  describe("generate(string | null, SelfHostedApiOptions & EmailDomainOptions)", () => {
    it.each([null, ""])("throws an error if the token is missing (token = %p)", async (token) => {
      const apiService = mockApiService(200, {});
      const i18nService = mockI18nService();

      const forwarder = new FirefoxRelayForwarder(apiService, i18nService, null, null, null);

      await expect(
        async () =>
          await forwarder.generate({
            website: null,
            token,
          }),
      ).rejects.toEqual("forwaderInvalidToken");

      expect(apiService.nativeFetch).not.toHaveBeenCalled();
      expect(i18nService.t).toHaveBeenCalledWith(
        "forwaderInvalidToken",
        Forwarders.FirefoxRelay.name,
      );
    });

    it.each([
      ["forwarderGeneratedByWithWebsite", "provided", "bitwarden.com", "bitwarden.com"],
      ["forwarderGeneratedByWithWebsite", "provided", "httpbin.org", "httpbin.org"],
      ["forwarderGeneratedBy", "not provided", null, ""],
      ["forwarderGeneratedBy", "not provided", "", ""],
    ])(
      "describes the website with %p when the website is %s (= %p)",
      async (translationKey, _ignored, website, expectedWebsite) => {
        const apiService = mockApiService(200, {});
        const i18nService = mockI18nService();

        const forwarder = new FirefoxRelayForwarder(apiService, i18nService, null, null, null);

        await forwarder.generate({
          website,
          token: "token",
        });

        // counting instances is terribly flaky over changes, but jest doesn't have a better way to do this
        expect(i18nService.t).toHaveBeenCalledWith(translationKey, expectedWebsite);
      },
    );

    it.each([
      ["jane.doe@duck.com", 201],
      ["john.doe@duck.com", 201],
      ["jane.doe@duck.com", 200],
      ["john.doe@duck.com", 200],
    ])(
      "returns the generated email address (= %p) if the request is successful (status = %p)",
      async (full_address, status) => {
        const apiService = mockApiService(status, { full_address });
        const i18nService = mockI18nService();

        const forwarder = new FirefoxRelayForwarder(apiService, i18nService, null, null, null);

        const result = await forwarder.generate({
          website: null,
          token: "token",
        });

        expect(result).toEqual(full_address);
        expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
      },
    );

    it("throws an invalid token error if the request fails with a 401", async () => {
      const apiService = mockApiService(401, {});
      const i18nService = mockI18nService();

      const forwarder = new FirefoxRelayForwarder(apiService, i18nService, null, null, null);

      await expect(
        async () =>
          await forwarder.generate({
            website: null,
            token: "token",
          }),
      ).rejects.toEqual("forwaderInvalidToken");

      expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
      // counting instances is terribly flaky over changes, but jest doesn't have a better way to do this
      expect(i18nService.t).toHaveBeenNthCalledWith(
        2,
        "forwaderInvalidToken",
        Forwarders.FirefoxRelay.name,
      );
    });

    it.each([100, 202, 300, 418, 500, 600])(
      "throws an unknown error if the request returns any other status code (= %i)",
      async (statusCode) => {
        const apiService = mockApiService(statusCode, {});
        const i18nService = mockI18nService();

        const forwarder = new FirefoxRelayForwarder(apiService, i18nService, null, null, null);

        await expect(
          async () =>
            await forwarder.generate({
              website: null,
              token: "token",
            }),
        ).rejects.toEqual("forwarderUnknownError");

        expect(apiService.nativeFetch).toHaveBeenCalledWith(expect.any(Request));
        // counting instances is terribly flaky over changes, but jest doesn't have a better way to do this
        expect(i18nService.t).toHaveBeenNthCalledWith(
          2,
          "forwarderUnknownError",
          Forwarders.FirefoxRelay.name,
        );
      },
    );
  });
});
