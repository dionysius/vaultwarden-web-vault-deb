import { ApiService } from "../abstractions/api.service";

import { Forwarder } from "./forwarder";
import { ForwarderOptions } from "./forwarderOptions";

export class DuckDuckGoForwarder implements Forwarder {
  async generate(apiService: ApiService, options: ForwarderOptions): Promise<string> {
    if (options.apiKey == null || options.apiKey === "") {
      throw "Invalid DuckDuckGo API token.";
    }
    const requestInit: RequestInit = {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + options.apiKey,
        "Content-Type": "application/json",
      }),
    };
    const url = "https://quack.duckduckgo.com/api/email/addresses";
    const request = new Request(url, requestInit);
    const response = await apiService.nativeFetch(request);
    if (response.status === 200 || response.status === 201) {
      const json = await response.json();
      if (json.address) {
        return `${json.address}@duck.com`;
      }
    } else if (response.status === 401) {
      throw "Invalid DuckDuckGo API token.";
    }
    throw "Unknown DuckDuckGo error occurred.";
  }
}
