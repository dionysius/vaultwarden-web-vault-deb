import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { StateProvider } from "@bitwarden/common/platform/state";

import { Forwarders, DefaultFirefoxRelayOptions } from "../../data";
import { ApiOptions } from "../../types";
import { ForwarderGeneratorStrategy } from "../forwarder-generator-strategy";
import { FIREFOX_RELAY_FORWARDER, FIREFOX_RELAY_BUFFER } from "../storage";

/** Generates a forwarding address for Firefox Relay */
export class FirefoxRelayForwarder extends ForwarderGeneratorStrategy<ApiOptions> {
  /** Instantiates the forwarder
   *  @param apiService used for ajax requests to the forwarding service
   *  @param i18nService used to look up error strings
   *  @param encryptService protects sensitive forwarder options
   *  @param keyService looks up the user key when protecting data.
   *  @param stateProvider creates the durable state for options storage
   */
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    encryptService: EncryptService,
    keyService: CryptoService,
    stateProvider: StateProvider,
  ) {
    super(encryptService, keyService, stateProvider, DefaultFirefoxRelayOptions);
  }

  // configuration
  readonly key = FIREFOX_RELAY_FORWARDER;
  readonly rolloverKey = FIREFOX_RELAY_BUFFER;

  // request
  generate = async (options: ApiOptions) => {
    if (!options.token || options.token === "") {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.FirefoxRelay.name);
      throw error;
    }

    const url = "https://relay.firefox.com/api/v1/relayaddresses/";

    let descriptionId = "forwarderGeneratedByWithWebsite";
    if (!options.website || options.website === "") {
      descriptionId = "forwarderGeneratedBy";
    }
    const description = this.i18nService.t(descriptionId, options.website ?? "");

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
        generated_for: options.website,
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
  };
}

export const DefaultOptions = Object.freeze({
  website: null,
  token: "",
});
