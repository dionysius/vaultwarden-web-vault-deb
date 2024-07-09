import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { IntegrationRequest } from "./integration-request";
import { JsonRpc } from "./rpc";

/** Makes remote procedure calls using a RESTful interface. */
export class RestClient {
  constructor(
    private api: ApiService,
    private i18n: I18nService,
  ) {}
  /** uses the fetch API to request a JSON payload. */
  async fetchJson<Parameters extends IntegrationRequest, Response>(
    rpc: JsonRpc<Parameters, Response>,
    params: Parameters,
  ): Promise<Response> {
    const request = rpc.toRequest(params);
    const response = await this.api.nativeFetch(request);

    // FIXME: once legacy password generator is removed, replace forwarder-specific error
    //   messages with RPC-generalized ones.
    let error: string = undefined;
    let cause: string = undefined;

    if (response.status === 401 || response.status === 403) {
      cause = await this.tryGetErrorMessage(response);
      error = cause ? "forwarderInvalidTokenWithMessage" : "forwarderInvalidToken";
    } else if (response.status >= 500) {
      cause = await this.tryGetErrorMessage(response);
      cause = cause ?? response.statusText;
      error = "forwarderError";
    }

    let ok: Response = undefined;
    if (!error && rpc.hasJsonPayload(response)) {
      [ok, cause] = rpc.processJson(await response.json());
    }

    // success
    if (ok) {
      return ok;
    }

    // failure
    if (!error) {
      error = cause ? "forwarderError" : "forwarderUnknownError";
    }
    throw this.i18n.t(error, rpc.requestor.name, cause);
  }

  private async tryGetErrorMessage(response: Response) {
    const body = (await response.text()) ?? "";

    if (!body.startsWith("{")) {
      return undefined;
    }

    const json = JSON.parse(body);
    if ("error" in json) {
      return json.error;
    } else if ("message" in json) {
      return json.message;
    }

    return undefined;
  }
}
