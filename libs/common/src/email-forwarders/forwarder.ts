import { ApiService } from "../abstractions/api.service";

import { ForwarderOptions } from "./forwarder-options";

export interface Forwarder {
  generate(apiService: ApiService, options: ForwarderOptions): Promise<string>;
}
