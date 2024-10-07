import { Observable } from "rxjs";

import { BitwardenClient } from "@bitwarden/sdk-internal";

export abstract class SdkService {
  client$: Observable<BitwardenClient>;
  supported$: Observable<boolean>;
}
