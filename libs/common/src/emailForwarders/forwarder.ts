import { ApiService } from "../abstractions/api.service";

import { ForwarderOptions } from "./forwarderOptions";

export interface Forwarder {
  generate(apiService: ApiService, options: ForwarderOptions): Promise<string>;
}
