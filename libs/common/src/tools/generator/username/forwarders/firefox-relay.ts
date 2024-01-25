import { ApiService } from "../../../../abstractions/api.service";
import { I18nService } from "../../../../platform/abstractions/i18n.service";
import { Forwarders } from "../options/constants";
import { Forwarder, ApiOptions } from "../options/forwarder-options";

/** Generates a forwarding address for Firefox Relay */
export class FirefoxRelayForwarder implements Forwarder {
  /** Instantiates the forwarder
   *  @param apiService used for ajax requests to the forwarding service
   *  @param i18nService used to look up error strings
   */
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
  ) {}

  /** {@link Forwarder.generate} */
  async generate(website: string | null, options: ApiOptions): Promise<string> {
    if (!options.token || options.token === "") {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.FirefoxRelay.name);
      throw error;
    }

    const url = "https://relay.firefox.com/api/v1/relayaddresses/";

    const descriptionId =
      website && website !== "" ? "forwarderGeneratedByWithWebsite" : "forwarderGeneratedBy";
    const description = this.i18nService.t(descriptionId, website ?? "");

    const request = new Request(url, {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Token " + options.token,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        enabled: true,
        generated_for: website,
        description,
      }),
    });

    const response = await this.apiService.nativeFetch(request);
    if (response.status === 401) {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.FirefoxRelay.name);
      throw error;
    } else if (response.status === 200 || response.status === 201) {
      const json = await response.json();
      return json.full_address;
    } else {
      const error = this.i18nService.t("forwarderUnknownError", Forwarders.FirefoxRelay.name);
      throw error;
    }
  }
}
