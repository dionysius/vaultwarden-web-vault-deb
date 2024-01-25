import { ApiService } from "../../../../abstractions/api.service";
import { I18nService } from "../../../../platform/abstractions/i18n.service";
import { Utils } from "../../../../platform/misc/utils";
import { Forwarders } from "../options/constants";
import { EmailDomainOptions, Forwarder, ApiOptions } from "../options/forwarder-options";

/** Generates a forwarding address for Forward Email */
export class ForwardEmailForwarder implements Forwarder {
  /** Instantiates the forwarder
   *  @param apiService used for ajax requests to the forwarding service
   *  @param i18nService used to look up error strings
   */
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
  ) {}

  /** {@link Forwarder.generate} */
  async generate(
    website: string | null,
    options: ApiOptions & EmailDomainOptions,
  ): Promise<string> {
    if (!options.token || options.token === "") {
      const error = this.i18nService.t("forwaderInvalidToken", Forwarders.ForwardEmail.name);
      throw error;
    }
    if (!options.domain || options.domain === "") {
      const error = this.i18nService.t("forwarderNoDomain", Forwarders.ForwardEmail.name);
      throw error;
    }

    const url = `https://api.forwardemail.net/v1/domains/${options.domain}/aliases`;

    const descriptionId =
      website && website !== "" ? "forwarderGeneratedByWithWebsite" : "forwarderGeneratedBy";
    const description = this.i18nService.t(descriptionId, website ?? "");

    const request = new Request(url, {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Basic " + Utils.fromUtf8ToB64(options.token + ":"),
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        labels: website,
        description,
      }),
    });

    const response = await this.apiService.nativeFetch(request);
    const json = await response.json();

    if (response.status === 401) {
      const messageKey =
        "message" in json ? "forwaderInvalidTokenWithMessage" : "forwaderInvalidToken";
      const error = this.i18nService.t(messageKey, Forwarders.ForwardEmail.name, json.message);
      throw error;
    } else if (response.status === 200 || response.status === 201) {
      const { name, domain } = await response.json();
      const domainPart = domain?.name || options.domain;
      return `${name}@${domainPart}`;
    } else if (json?.message) {
      const error = this.i18nService.t(
        "forwarderError",
        Forwarders.ForwardEmail.name,
        json.message,
      );
      throw error;
    } else if (json?.error) {
      const error = this.i18nService.t("forwarderError", Forwarders.ForwardEmail.name, json.error);
      throw error;
    } else {
      const error = this.i18nService.t("forwarderUnknownError", Forwarders.ForwardEmail.name);
      throw error;
    }
  }
}
