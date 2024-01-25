import { ApiService } from "../../../../abstractions/api.service";
import { I18nService } from "../../../../platform/abstractions/i18n.service";
import { Forwarders } from "../options/constants";
import { ApiOptions, Forwarder } from "../options/forwarder-options";

/** Generates a forwarding address for DuckDuckGo */
export class DuckDuckGoForwarder implements Forwarder {
  /** Instantiates the forwarder
   *  @param apiService used for ajax requests to the forwarding service
   *  @param i18nService used to look up error strings
   */
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
  ) {}

  /** {@link Forwarder.generate} */
  async generate(_website: string | null, options: ApiOptions): Promise<string> {
    if (!options.token || options.token === "") {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.DuckDuckGo.name);
      throw error;
    }

    const url = "https://quack.duckduckgo.com/api/email/addresses";
    const request = new Request(url, {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + options.token,
        "Content-Type": "application/json",
      }),
    });

    const response = await this.apiService.nativeFetch(request);
    if (response.status === 200 || response.status === 201) {
      const json = await response.json();
      if (json.address) {
        return `${json.address}@duck.com`;
      } else {
        const error = this.i18nService.t("forwarderUnknownError", Forwarders.DuckDuckGo.name);
        throw error;
      }
    } else if (response.status === 401) {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.DuckDuckGo.name);
      throw error;
    } else {
      const error = this.i18nService.t("forwarderUnknownError", Forwarders.DuckDuckGo.name);
      throw error;
    }
  }
}
