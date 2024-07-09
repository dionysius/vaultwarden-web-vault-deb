import { mock } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { IntegrationRequest } from "./integration-request";
import { RestClient } from "./rest-client";
import { JsonRpc } from "./rpc";

describe("RestClient", () => {
  const expectedRpc = {
    fetchRequest: {} as any,
    json: {},
  } as const;

  const i18n = mock<I18nService>();
  const nativeFetchResponse = mock<Response>({ status: 200 });
  const api = mock<ApiService>();
  const rpc = mock<JsonRpc<IntegrationRequest, object>>({ requestor: { name: "mock" } });

  beforeEach(() => {
    i18n.t.mockImplementation((a) => a);

    api.nativeFetch.mockResolvedValue(nativeFetchResponse);

    rpc.toRequest.mockReturnValue(expectedRpc.fetchRequest);
    rpc.hasJsonPayload.mockReturnValue(true);
    rpc.processJson.mockImplementation((json: any) => [expectedRpc.json]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("fetchJson", () => {
    it("issues a request", async () => {
      const client = new RestClient(api, i18n);
      const request: IntegrationRequest = { website: null };

      const result = await client.fetchJson(rpc, request);

      expect(result).toBe(expectedRpc.json);
    });

    it("invokes the constructed request", async () => {
      const client = new RestClient(api, i18n);
      const request: IntegrationRequest = { website: null };

      await client.fetchJson(rpc, request);

      expect(api.nativeFetch).toHaveBeenCalledWith(expectedRpc.fetchRequest);
    });

    it.each([[401], [403]])(
      "throws an invalid token error when HTTP status is %i",
      async (status) => {
        const client = new RestClient(api, i18n);
        const request: IntegrationRequest = { website: null };
        const response = mock<Response>({ status });
        api.nativeFetch.mockResolvedValue(response);

        const result = client.fetchJson(rpc, request);

        await expect(result).rejects.toEqual("forwarderInvalidToken");
      },
    );

    it.each([
      [401, "message"],
      [403, "message"],
      [401, "error"],
      [403, "error"],
    ])(
      "throws an invalid token detailed error when HTTP status is %i and the payload has a %s",
      async (status, property) => {
        const client = new RestClient(api, i18n);
        const request: IntegrationRequest = { website: null };
        const response = mock<Response>({
          status,
          text: () => Promise.resolve(`{ "${property}": "expected message" }`),
        });
        api.nativeFetch.mockResolvedValue(response);

        const result = client.fetchJson(rpc, request);

        await expect(result).rejects.toEqual("forwarderInvalidTokenWithMessage");
        expect(i18n.t).toHaveBeenCalledWith(
          "forwarderInvalidTokenWithMessage",
          "mock",
          "expected message",
        );
      },
    );

    it.each([[500], [501]])(
      "throws a forwarder error with the status text when HTTP status is %i",
      async (status) => {
        const client = new RestClient(api, i18n);
        const request: IntegrationRequest = { website: null };
        const response = mock<Response>({ status, statusText: "expectedResult" });
        api.nativeFetch.mockResolvedValue(response);

        const result = client.fetchJson(rpc, request);

        await expect(result).rejects.toEqual("forwarderError");
        expect(i18n.t).toHaveBeenCalledWith("forwarderError", "mock", "expectedResult");
      },
    );

    it.each([
      [500, "message"],
      [500, "message"],
      [501, "error"],
      [501, "error"],
    ])(
      "throws a detailed forwarder error when HTTP status is %i and the payload has a %s",
      async (status, property) => {
        const client = new RestClient(api, i18n);
        const request: IntegrationRequest = { website: null };
        const response = mock<Response>({
          status,
          text: () => Promise.resolve(`{ "${property}": "expected message" }`),
        });
        api.nativeFetch.mockResolvedValue(response);

        const result = client.fetchJson(rpc, request);

        await expect(result).rejects.toEqual("forwarderError");
        expect(i18n.t).toHaveBeenCalledWith("forwarderError", "mock", "expected message");
      },
    );

    it("outputs an error if there's no json payload", async () => {
      const client = new RestClient(api, i18n);
      rpc.hasJsonPayload.mockReturnValue(false);
      const request: IntegrationRequest = { website: null };

      const result = client.fetchJson(rpc, request);

      await expect(result).rejects.toEqual("forwarderUnknownError");
    });

    it("processes an ok JSON payload", async () => {
      const client = new RestClient(api, i18n);
      rpc.processJson.mockReturnValue([{ foo: true }]);
      const request: IntegrationRequest = { website: null };

      const result = client.fetchJson(rpc, request);

      await expect(result).resolves.toEqual({ foo: true });
    });

    it("processes an erroneous JSON payload", async () => {
      const client = new RestClient(api, i18n);
      rpc.processJson.mockReturnValue([undefined, "expected message"]);
      const request: IntegrationRequest = { website: null };

      const result = client.fetchJson(rpc, request);

      await expect(result).rejects.toEqual("forwarderError");
      expect(i18n.t).toHaveBeenCalledWith("forwarderError", "mock", "expected message");
    });
  });
});
