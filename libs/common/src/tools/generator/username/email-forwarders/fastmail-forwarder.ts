import { ApiService } from "../../../../abstractions/api.service";

import { Forwarder } from "./forwarder";
import { ForwarderOptions } from "./forwarder-options";

export class FastmailForwarder implements Forwarder {
  async generate(apiService: ApiService, options: ForwarderOptions): Promise<string> {
    if (options.apiKey == null || options.apiKey === "") {
      throw "Invalid Fastmail API token.";
    }

    const accountId = await this.getAccountId(apiService, options);
    if (accountId == null || accountId === "") {
      throw "Unable to obtain Fastmail masked email account ID.";
    }

    const forDomain = options.website || "";

    const requestInit: RequestInit = {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + options.apiKey,
        "Content-Type": "application/json",
      }),
    };
    const url = "https://api.fastmail.com/jmap/api/";
    requestInit.body = JSON.stringify({
      using: ["https://www.fastmail.com/dev/maskedemail", "urn:ietf:params:jmap:core"],
      methodCalls: [
        [
          "MaskedEmail/set",
          {
            accountId: accountId,
            create: {
              "new-masked-email": {
                state: "enabled",
                description: "",
                forDomain: forDomain,
                emailPrefix: options.fastmail.prefix,
              },
            },
          },
          "0",
        ],
      ],
    });
    const request = new Request(url, requestInit);
    const response = await apiService.nativeFetch(request);
    if (response.status === 200) {
      const json = await response.json();
      if (
        json.methodResponses != null &&
        json.methodResponses.length > 0 &&
        json.methodResponses[0].length > 0
      ) {
        if (json.methodResponses[0][0] === "MaskedEmail/set") {
          if (json.methodResponses[0][1]?.created?.["new-masked-email"] != null) {
            return json.methodResponses[0][1]?.created?.["new-masked-email"]?.email;
          }
          if (json.methodResponses[0][1]?.notCreated?.["new-masked-email"] != null) {
            throw (
              "Fastmail error: " +
              json.methodResponses[0][1]?.notCreated?.["new-masked-email"]?.description
            );
          }
        } else if (json.methodResponses[0][0] === "error") {
          throw "Fastmail error: " + json.methodResponses[0][1]?.description;
        }
      }
    }
    if (response.status === 401 || response.status === 403) {
      throw "Invalid Fastmail API token.";
    }
    throw "Unknown Fastmail error occurred.";
  }

  private async getAccountId(apiService: ApiService, options: ForwarderOptions): Promise<string> {
    const requestInit: RequestInit = {
      cache: "no-store",
      method: "GET",
      headers: new Headers({
        Authorization: "Bearer " + options.apiKey,
      }),
    };
    const url = "https://api.fastmail.com/.well-known/jmap";
    const request = new Request(url, requestInit);
    const response = await apiService.nativeFetch(request);
    if (response.status === 200) {
      const json = await response.json();
      if (json.primaryAccounts != null) {
        return json.primaryAccounts["https://www.fastmail.com/dev/maskedemail"];
      }
    }
    return null;
  }
}
